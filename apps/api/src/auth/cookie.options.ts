import { CookieOptions } from 'express';

// 클라이언트를 통해 전송된 토큰 유효기간
// 브라우저가 쿠키를 자동으로 삭제하는 시간
export const ACCESS_TOKEN_MAX_AGE_MS = parseInt(process.env.COOKIE_ACCESS_TOKEN_MAZ_AGE_MS ?? '3600000'); // 기본 1시간
export const REFRESH_TOKEN_MAX_AGE_MS = parseInt(process.env.COOKIE_REFRESH_TOKEN_MAZ_AGE_MS ?? '604800000');
// export const ACCESS_TOKEN_MAX_AGE_MS = 60 * 60 * 1000; // 액세스 토큰 유효기간(1시간)
// export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 리프레시 토큰 유효기간(7일)
// export const ACCESS_TOKEN_MAX_AGE_MS = 60 * 1000; // 테스트용 액세스 토큰 유효기간 (1분)
// export const REFRESH_TOKEN_MAX_AGE_MS = 5 * 60 * 1000; // 테스트용 리프레시 토큰 유효기간(5분)

export const cookieOptions = (overrides: CookieOptions = {}): CookieOptions => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSiteValue = isProd ? 'none' : 'lax';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: sameSiteValue,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 로그인 유지 시간: 24시간 (밀리초 단위)
    ...overrides,
  };
};

export const accessCookieOptions = (overrides: CookieOptions = {}): CookieOptions =>
  cookieOptions({
    // 액세스 토큰은 짧은 수명으로 발급
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    ...overrides,
  });

export const refreshCookieOptions = (overrides: CookieOptions = {}): CookieOptions =>
  cookieOptions({
    // 리프레시 토큰은 갱신 엔드포인트에서만 전송
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: '/auth/refresh',
    ...overrides,
  });
