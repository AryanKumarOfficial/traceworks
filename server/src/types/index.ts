export interface JwtPayload {
  exp?: number;
  [key: string]: any;
}

export interface AccessTokenPayload extends JwtPayload {
  sub: number;
}

export interface User {
  id: number;
  user_name: string;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
}

export interface RefreshTokenRow {
  user_id: number;
  expires_at: Date | string;
}
