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
    '/login',
    '/',
  ],
}
