import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

/**
 * DbService
 *
 * - Creates a pg Pool.
 * - Waits for DB availability (simple retry/backoff).
 * - Loads and executes a migration SQL file (if present).
 *
 * Environment:
 * - DATABASE_URL (default to postgres://app:secret@localhost:5432/appdb)
 * - MIGRATIONS_PATH  (optional override; defaults to ../migrations/init.sql)
 * - DB_CONNECT_RETRIES (optional, default 6)
 * - DB_CONNECT_RETRY_DELAY (ms, optional, default 1000)
 */
@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  pool: Pool;
  private readonly migrationsPathEnv?: string;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;

  constructor() {
    const connection =
      process.env.DATABASE_URL || 'postgres://app:secret@localhost:5432/appdb';

    this.pool = new Pool({ connectionString: connection });

    // configurable migration path (useful for tests)
    this.migrationsPathEnv = process.env.MIGRATIONS_PATH;

    this.maxRetries = parseInt(process.env.DB_CONNECT_RETRIES || '6', 10);
    this.baseDelayMs = parseInt(
      process.env.DB_CONNECT_RETRY_DELAY || '1000',
      10,
    );
  }

  /**
   * Simple sleep helper.
   */
  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  /**
   * Wait for DB to be reachable by trying a lightweight query.
   * Uses exponential backoff up to `maxRetries`.
   */
  private async waitForDb(): Promise<void> {
    if (process.env.SKIP_DB_WAIT === 'true') {
      console.info('SKIP_DB_WAIT=true — skipping DB readiness wait');
      return;
    }
    let attempt = 0;
    while (attempt < this.maxRetries) {
      attempt += 1;
      try {
        // try a quick query using pool.query (no client allocation needed)
        await this.pool.query('SELECT 1');
        // success
        return;
      } catch (err) {
        const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `DB not ready (attempt ${attempt}/${this.maxRetries}), retrying in ${delay}ms...`,
        );
        await this.sleep(delay);
      }
    }
    // if we exited loop without success, throw
    throw new Error(
      `Unable to connect to DB after ${this.maxRetries} attempts`,
    );
  }

  /**
   * Resolve candidate migration file paths and return the first that exists.
   */
  private resolveMigrationPath(): string | null {
    // 1. explicit environment override
    if (this.migrationsPathEnv) {
      if (fsSync.existsSync(this.migrationsPathEnv))
        return this.migrationsPathEnv;
      console.warn(
        'MIGRATIONS_PATH set but file not found at',
        this.migrationsPathEnv,
      );
    }

    // 2. project root / migrations/init.sql (process.cwd())
    const p1 = path.resolve(process.cwd(), 'migrations', 'init.sql');
    if (fsSync.existsSync(p1)) return p1;

    // 3. src relative path (useful when running ts-node)
    //    __dirname points to .../src in ts-node dev environment
    const p2 = path.resolve(__dirname, '..', 'migrations', 'init.sql');
    if (fsSync.existsSync(p2)) return p2;

    // 4. dist relative path (useful when running compiled code from project root)
    const p3 = path.resolve(__dirname, '..', '..', 'migrations', 'init.sql');
    if (fsSync.existsSync(p3)) return p3;

    // 5. another common layout: projectRoot/dist/migrations/init.sql
    const p4 = path.resolve(process.cwd(), 'dist', 'migrations', 'init.sql');
    if (fsSync.existsSync(p4)) return p4;

    // none found
    return null;
  }

  /**
   * Run at module init:
   * - wait for DB
   * - if migrations file exists, read and execute it using a client
   */
  async onModuleInit() {
    try {
      await this.waitForDb();
    } catch (err) {
      console.error('DB connection checks failed:', err);
      // Let the app continue or throw — choose to throw to avoid starting app without DB.
      // If you prefer allow the app to start anyway, comment the next line out.
      throw err;
    }

    // find migration file in best candidate path
    const resolved = this.resolveMigrationPath();
    if (!resolved) {
      console.info('No migration file found in candidate locations. Searched:');
      console.info('- MIGRATIONS_PATH:', this.migrationsPathEnv || '(not set)');
      console.info('- process.cwd()/migrations/init.sql');
      console.info('- __dirname/../migrations/init.sql (src)');
      console.info('- __dirname/../../migrations/init.sql (dist)');
      console.info('- process.cwd()/dist/migrations/init.sql');
      return;
    }

    console.info('Using migration file at:', resolved);

    // attempt to run migration file if exists
    let client: PoolClient | undefined;
    try {
      const sql = await fs.readFile(resolved, 'utf8');
      if (!sql || !sql.trim()) {
        console.info('Migration file is empty, skipping:', resolved);
        return;
      }

      client = await this.pool.connect();
      try {
        // run migration (single call; pg accepts multiple statements separated by ;)
        await client.query(sql);
        console.info('DB migration applied from', resolved);
      } finally {
        // always release if we successfully acquired a client
        try {
          client.release();
        } catch (releaseErr) {
          console.warn('Error releasing DB client', releaseErr);
        }
      }
    } catch (err) {
      console.error('Error running DB migration', resolved, err);
      // don't rethrow here — depending on your preference, you can rethrow
      // to stop app boot or swallow to let the app continue.
      // throw err;
    }
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
      console.info('DB pool has been shut down');
    } catch (err) {
      console.warn('Error shutting down DB pool', err);
    }
  }
}
