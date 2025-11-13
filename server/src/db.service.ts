import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  pool: Pool;
  constructor() {
    const connection =
      process.env.DATABASE_URL || 'postgres://app:secret@localhost:5432/appdb';
    this.pool = new Pool({ connectionString: connection });
  }

  async onModuleInit() {
    // attempt to run migration file if exists
    try {
      const sqlPath = path.resolve(__dirname, '..', 'migrations', 'init.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        const client = await this.pool.connect();
        try {
          await client.query(sql);
          console.log('DB migration applied');
        } finally {
          client.release();
        }
      } else {
        console.warn('No migration file found at', sqlPath);
      }
    } catch (err) {
      console.error('Error running DB migration', err);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
