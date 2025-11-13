import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import type { User } from '../types';
import type { SignInDto, SignUpDto } from './dto';

/**
 * Small cookie parser helper (avoid cookie-parser dependency):
 * reads `req.headers.cookie` and returns a map.
 */
function parseCookies(req: Request): Record<string, string> {
  const cookie = req.headers?.cookie;
  const out: Record<string, string> = {};
  if (!cookie) return out;
  cookie.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  });
  return out;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(
    @Body()
    body: SignUpDto,
    @Res() res: Response,
  ) {
    const { user_name, email, password } = body || {};
    if (!user_name || !email || !password)
      return res
        .status(400)
        .json({ ok: false, err: 'User Name, email and password required' });
    try {
      const user = await this.auth.createUser(user_name, email, password);
      return res.json({
        ok: true,
        user: { id: user?.id, userName: user?.user_name, email: user?.email },
      });
    } catch (err: any) {
      if (/(unique|duplicate)/i.test((err as Error).message)) {
        return res.status(409).json({ ok: false, err: 'email already exists' });
      }
      console.log(`Internal Error: `, err);
      return res.status(500).json({ ok: false, err: 'internal error' });
    }
  }

  @Post('login')
  async login(@Body() body: SignInDto, @Res() res: Response) {
    const { email, password } = body || {};
    if (!email || !password)
      return res
        .status(400)
        .json({ ok: false, err: 'email and password required' });
    const user = await this.auth.findUserByEmail(email);
    if (!user)
      return res.status(401).json({ ok: false, err: 'User Not found' });
    const ok = await this.auth.verifyPassword(
      password,
      user.salt,
      user.password_hash,
    );
    if (!ok)
      return res.status(401).json({ ok: false, err: 'invalid credentials' });

    const accessToken = this.auth.generateAccessToken(user.id);
    const refreshToken = this.auth.generateRefreshToken();
    await this.auth.saveRefreshToken(user.id, refreshToken);

    const secureFlag = process.env.NODE_ENV === 'production';
    // cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secureFlag,
      maxAge: this.auth.accessExp * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secureFlag,
      path: '/auth/refresh',
      maxAge: this.auth.refreshExp * 1000,
    });

    return res.json({ ok: true });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const cookies = parseCookies(req);
    const rt = cookies['refresh_token'] || req.headers['x-refresh-token'];
    if (!rt)
      return res.status(401).json({ ok: false, err: 'no refresh token' });

    const userId = await this.auth.validateRefreshToken(rt as string);
    if (!userId)
      return res.status(401).json({ ok: false, err: 'invalid refresh token' });

    const newAccess = this.auth.generateAccessToken(userId);
    const newRefresh = await this.auth.rotateRefreshToken(rt as string, userId);

    const secureFlag = process.env.NODE_ENV === 'production';
    res.cookie('access_token', newAccess, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secureFlag,
      maxAge: this.auth.accessExp * 1000,
    });
    res.cookie('refresh_token', newRefresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secureFlag,
      path: '/auth/refresh',
      maxAge: this.auth.refreshExp * 1000,
    });

    return res.json({ ok: true });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const cookies = parseCookies(req);
    const rt = cookies['refresh_token'] || req.headers['x-refresh-token'];
    if (rt) await this.auth.revokeRefreshToken(rt as string);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.json({ ok: true });
  }

  @Get('me')
  async me(@Req() req: Request, @Res() res: Response) {
    const cookies = parseCookies(req);
    const access = cookies['access_token'];
    if (!access)
      return res.status(401).json({ ok: false, err: 'no access token' });

    const payload = this.auth.verifyAccessToken(access);
    if (!payload)
      return res.status(401).json({ ok: false, err: 'invalid access token' });

    const r = await this.auth['db'].pool.query(
      'SELECT id, user_name,email FROM users WHERE id=$1',
      [payload.sub],
    );
    if (r.rowCount === 0) return res.status(401).json({ ok: false });
    return res.json({ ok: true, user: r.rows[0] as User });
  }
}
