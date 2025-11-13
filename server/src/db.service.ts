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
  private readonly migrationsPath: string;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;

  constructor() {
    const connection =
      process.env.DATABASE_URL || 'postgres://app:secret@localhost:5432/appdb';

    this.pool = new Pool({ connectionString: connection });

    // configurable migration path (useful for tests)
    this.migrationsPath =
      process.env.MIGRATIONS_PATH ||
      path.resolve(__dirname, '..', 'migrations', 'init.sql');

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

    // attempt to run migration file if exists
    let client: PoolClient | undefined;
    try {
      // check existence with synchronous check to avoid race (fast)
      if (!fsSync.existsSync(this.migrationsPath)) {
        console.info('No migration file found at', this.migrationsPath);
        return;
      }

      const sql = await fs.readFile(this.migrationsPath, 'utf8');
      if (!sql || !sql.trim()) {
        console.info('Migration file is empty, skipping:', this.migrationsPath);
        return;
      }

      client = await this.pool.connect();
      try {
        // run migration (single call; pg accepts multiple statements separated by ;)
        await client.query(sql);
        console.info('DB migration applied from', this.migrationsPath);
      } finally {
        // always release if we successfully acquired a client
        try {
          client.release();
        } catch (releaseErr) {
          console.warn('Error releasing DB client', releaseErr);
        }
      }
    } catch (err) {
      console.error('Error running DB migration', err);
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
