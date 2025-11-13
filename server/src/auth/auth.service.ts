import { Injectable } from '@nestjs/common';
import { DbService } from '../db.service';
import crypto from 'crypto';
import { signJwt, verifyJwt } from './jwt.util';
import { promisify } from 'util';
import { User, RefreshTokenRow, AccessTokenPayload } from '../types';

const scryptAsync = promisify(crypto.scrypt);

@Injectable()
export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'dev_secret';
  public accessExp = parseInt(process.env.ACCESS_TOKEN_EXP || '900', 10); // seconds
  public refreshExp = parseInt(process.env.REFRESH_TOKEN_EXP || '604800', 10); // seconds

  constructor(private db: DbService) {}

  async hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    return { salt, hash: derived.toString('hex') };
  }

  async verifyPassword(password: string, salt: string, hashHex: string) {
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hashHex, 'hex');
    if (expected.length !== derived.length) return false;
    return crypto.timingSafeEqual(expected, derived);
  }

  generateAccessToken(userId: number) {
    return signJwt<AccessTokenPayload>(
      { sub: userId },
      this.jwtSecret,
      this.accessExp,
    );
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex'); // opaque token
  }

  async saveRefreshToken(userId: number, token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + this.refreshExp * 1000);
    await this.db.pool.query(
      'INSERT INTO refresh_tokens(user_id, token_hash, expires_at) VALUES($1,$2,$3)',
      [userId, tokenHash, expiresAt],
    );
  }

  async revokeRefreshToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.db.pool.query('DELETE FROM refresh_tokens WHERE token_hash=$1', [
      tokenHash,
    ]);
  }

  async rotateRefreshToken(oldToken: string, userId: number) {
    await this.revokeRefreshToken(oldToken);
    const newToken = this.generateRefreshToken();
    await this.saveRefreshToken(userId, newToken);
    return newToken;
  }

  async validateRefreshToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const r = await this.db.pool.query(
      'SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash=$1',
      [tokenHash],
    );
    if (r.rowCount === 0) return null;

    const row = r.rows[0] as RefreshTokenRow;
    if (new Date(row.expires_at) < new Date()) {
      await this.revokeRefreshToken(token);
      return null;
    }
    return row.user_id;
  }

  async createUser(user_name: string, email: string, password: string) {
    const client = await this.db.pool.connect();
    try {
      const { salt, hash } = await this.hashPassword(password);
      const sql = `
      INSERT INTO users (user_name, email, password_hash, salt)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_name, email`;
      const params = [user_name, email, hash, salt];
      const r = await client.query(sql, params);
      return r.rows[0] as User | undefined;
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email: string) {
    const r = await this.db.pool.query(
      'SELECT id, email, password_hash, salt FROM users WHERE email=$1',
      [email],
    );
    return r.rows[0] as User | undefined;
  }

  verifyAccessToken(token: string) {
    const v = verifyJwt<AccessTokenPayload>(token, this.jwtSecret);
    if (v.valid && v.valid) {
      return v.payload;
    }
    return null;
  }
}
