import { AuthService } from '../src/auth/auth.service';
import { DbService } from '../src/db.service';

// Minimal mock DbService for unit tests (we don't touch DB here)
const mockDb: any = { pool: { query: jest.fn(), connect: jest.fn() } };

describe('AuthService (password hashing)', () => {
  let auth: AuthService;

  beforeAll(() => {
    auth = new AuthService(mockDb as unknown as DbService);
  });

  const cases = [
    { password: 'simple' },
    { password: 'S0m3$tr0ngP@ssw0rd!' },
    { password: '长度很长的密码-with-unicode-🚀' },
  ];

  test.each(cases)('hash and verify %#', async (c) => {
    const { salt, hash } = await auth.hashPassword(c.password);
    expect(typeof salt).toBe('string');
    expect(typeof hash).toBe('string');
    const ok = await auth.verifyPassword(c.password, salt, hash);
    expect(ok).toBe(true);
    const wrong = await auth.verifyPassword(c.password + 'x', salt, hash);
    expect(wrong).toBe(false);
  });
});
