/**
 * test/auth.service.db.spec.ts
 *
 * Unit-tests for AuthService DB-related methods using a mocked db.pool.query.
 */

import crypto from 'crypto';
import { promisify } from 'util';
const scryptAsync = promisify(crypto.scrypt || crypto.scrypt);

jest.resetModules();

describe('AuthService - DB interactions', () => {
  let AuthService: any;
  let auth: any;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    // create a fake DbService with a mock pool
    mockQuery = jest.fn();

    const fakeDb = {
      pool: {
        query: mockQuery,
      },
    };

    // require after creating fakeDb type
    AuthService = require('../src/auth/auth.service').AuthService;
    auth = new AuthService(fakeDb);
  });

  it('saveRefreshToken inserts hashed token and expiry', async () => {
    mockQuery.mockResolvedValueOnce({}); // simulate insert

    const userId = 5;
    const token = 'my-refresh-token-123';
    await auth.saveRefreshToken(userId, token);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO refresh_tokens/i);
    expect(params[0]).toBe(userId);
    // params[1] is the hash of token
    const expectedHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    expect(params[1]).toBe(expectedHash);
    // params[2] is a Date object (expires_at)
    expect(params[2]).toBeInstanceOf(Date);
  });

  it('validateRefreshToken returns null for missing token', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const res = await auth.validateRefreshToken('nonexistent');
    expect(res).toBeNull();
  });

  it('validateRefreshToken returns null for expired token and revokes it', async () => {
    // return one row with expired date
    const expiredDate = new Date(Date.now() - 1000 * 60 * 60); // in the past
    mockQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ user_id: 7, expires_at: expiredDate }],
    });
    // second query is for deletion invoked by revokeRefreshToken
    mockQuery.mockResolvedValueOnce({});

    const res = await auth.validateRefreshToken('oldtoken');
    expect(res).toBeNull();
    // ensure delete was called (second invocation)
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[1][0]).toMatch(/DELETE FROM refresh_tokens/i);
  });

  it('validateRefreshToken returns user_id when token valid', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60);
    mockQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ user_id: 9, expires_at: futureDate }],
    });

    const res = await auth.validateRefreshToken('valid-token');
    expect(res).toBe(9);
  });

  it('rotateRefreshToken revokes old and inserts new', async () => {
    // revoke (delete) call
    mockQuery.mockResolvedValueOnce({}); // for DELETE
    // save new refresh token call (INSERT)
    mockQuery.mockResolvedValueOnce({}); // for INSERT

    const newTok = await auth.rotateRefreshToken('oldtoken', 42);
    expect(typeof newTok).toBe('string');
    // revoke call + save call -> 2 calls
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[0][0]).toMatch(/DELETE FROM refresh_tokens/i);
    expect(mockQuery.mock.calls[1][0]).toMatch(/INSERT INTO refresh_tokens/i);
  });
});
