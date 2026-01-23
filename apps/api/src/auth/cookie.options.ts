import { CookieOptions } from 'express';

export const cookieOptions = (overrides: CookieOptions = {}): CookieOptions => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSiteValue = isProd ? 'none' : 'lax';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: sameSiteValue,
    path: '/',
    ...overrides,
  };
};
