import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { Pool } from 'pg';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  pool: Pool;
  constructor() {
    const connection =
      process.env.DATABASE_URL || 'postgres://app:secret@localhost:5432/appdb';
    this.pool = new Pool({ connectionString: connection });
  }

  async onModuleInit() {
    // ensure tables
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
         id SERIAL PRIMARY KEY,
         email TEXT UNIQUE NOT NULL,
         password_hash TEXT NOT NULL,
         salt TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT now()
          );


        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT now()
          );
      `);
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
