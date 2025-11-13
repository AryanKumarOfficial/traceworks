import crypto from 'crypto';
import { JwtPayload } from '../types';

function base64Url(buf: Buffer) {
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwt<T extends JwtPayload>(
  payload: T,
  secret: string,
  expiresInSeconds: number,
) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = { ...payload, exp };
  const headerB = Buffer.from(JSON.stringify(header));
  const bodyB = Buffer.from(JSON.stringify(body));
  const signingInput = `${base64Url(headerB)}.${base64Url(bodyB)}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest();
  return `${signingInput}.${base64Url(signature)}`;
}

export function verifyJwt<T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string,
): { valid: boolean; payload?: T; err?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, err: 'invalid token' };
    const [h, b, sig] = parts;
    const signingInput = `${h}.${b}`;
    const expectedSig = base64Url(
      crypto.createHmac('sha256', secret).update(signingInput).digest(),
    );
    if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
      return { valid: false, err: 'signature mismatch' };
    }

    const parsed: unknown = JSON.parse(
      Buffer.from(b, 'base64').toString('utf8'),
    );

    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, err: 'invalid payload structure' };
    }

    const payload = parsed as T;

    if (payload.exp && Math.floor(Date.now() / 1000) > Number(payload.exp)) {
      return { valid: false, err: 'expired' };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, err: (e as Error).message };
  }
}
