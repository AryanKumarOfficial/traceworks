/**
 * test/db.service.spec.ts
 *
 * Mocks 'pg' Pool so we can assert that onModuleInit reads migration SQL and calls pool.connect() -> client.query()
 * Also tests onModuleDestroy -> pool.end() is called.
 */

import fs from 'fs';
import path from 'path';

// Create a mock Pool implementation and mock the 'pg' module
const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockClient = {
  query: mockQuery,
  release: mockRelease,
};

const mockConnect = jest.fn(() => mockClient); // return a promise, like real pool.connect()
const mockEnd = jest.fn(async () => {});

class MockPool {
  connect = mockConnect;
  query = mockQuery;
  end = mockEnd;
  constructor(_opts: any) {}
}

// mock pg import BEFORE we import DbService
jest.mock('pg', () => ({ Pool: MockPool }));

describe('DbService', () => {
  let DbService: any;
  let db: any;
  const migrationsPath = path.resolve(
    __dirname,
    '..',
    'migrations',
    'init.sql',
  );

  beforeEach(() => {
    // Reset modules so our require() picks up the mocked 'pg'
    jest.resetModules();

    // Clear call history but keep implementations
    mockQuery.mockClear();
    mockConnect.mockClear();
    mockRelease.mockClear();
    mockEnd.mockClear();

    // Ensure connect() returns the client implementation (re-apply in case)
    mockConnect.mockImplementation(() => mockClient);

    // ensure migrations dir exists for tests to avoid false path warnings
    if (!fs.existsSync(path.dirname(migrationsPath))) {
      fs.mkdirSync(path.dirname(migrationsPath), { recursive: true });
    }
  });

  // afterEach(() => {
  //   // clean up any test migration file
  //   if (fs.existsSync(migrationsPath)) fs.unlinkSync(migrationsPath);
  // });

  it('runs migration SQL when init.sql exists and calls client.query', async () => {
    // write a small SQL file to be picked up
    fs.writeFileSync(migrationsPath, 'SELECT 1;');

    // now import DbService (which will use mocked Pool)
    DbService = require('../src/db.service').DbService;
    db = new DbService();

    await db.onModuleInit();

    // should have called pool.connect() -> client.query(sql)
    expect(mockConnect).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalled(); // client.query should have been executed
    // verify that client.release was called at least once
    expect(mockRelease).toHaveBeenCalled();
  });

  it('does not fail when init.sql is missing (falls back)', async () => {
    // ensure file doesn't exist
    if (fs.existsSync(migrationsPath)) fs.unlinkSync(migrationsPath);

    DbService = require('../src/db.service').DbService;
    db = new DbService();

    // Should not throw
    await expect(db.onModuleInit()).resolves.not.toThrow();
  });

  it('calls pool.end on destroy', async () => {
    DbService = require('../src/db.service').DbService;
    db = new DbService();
    await db.onModuleDestroy();
    expect(mockEnd).toHaveBeenCalled();
  });
});
