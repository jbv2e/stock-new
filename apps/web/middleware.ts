// 이 미들웨어는 요청된 경로에 따라 사용자의 인증 상태를 확인하고 적절한 페이지로 리디렉션하는 역할을 합니다.
// - 사용자가 로그인하지 않은 상태에서 보호된 페이지(로그인 및 인증 페이지 제외)에 접근하려고 하면 로그인 페이지로 리디렉션합니다.
// - 사용자가 이미 로그인한 상태에서 로그인 페이지에 접근하려고 하면 대시보드로 리디렉션합니다.
// - 그 외의 경우에는 요청을 그대로 진행합니다.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value

  const isLoginPage = req.nextUrl.pathname.startsWith('/login')
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')

  // 로그인 안 되었는데 보호 페이지에 접근할 때 → login으로
  if (!token && !isLoginPage && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 로그인 되어있는데 또 /login 가려고 하면 → 대시보드로
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/login',
    '/',
  ],
}