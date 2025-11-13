import { signJwt, verifyJwt } from '../src/auth/jwt.util';

describe('JWT util (table-driven)', () => {
  const secret = 'testsecret';
  const cases = [
    { payload: { sub: 1 }, exp: 2 },
    { payload: { sub: 42, role: 'admin' }, exp: 60 },
  ];

  test.each(cases)('create + verify token %#', (c) => {
    const token = signJwt(c.payload, secret, c.exp);
    const v = verifyJwt(token, secret);
    expect(v.valid).toBe(true);
    if (v.valid) {
      expect(v.payload?.sub).toBe(c.payload.sub);
    }
  });

  it('rejects expired token', () => {
    const token = signJwt({ sub: 1 }, secret, -1);
    const v = verifyJwt(token, secret);
    expect(v.valid).toBe(false);
    expect(v.err).toMatch(/expired/);
  });
});
