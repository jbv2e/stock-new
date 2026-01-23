// 이 미들웨어는 요청된 경로에 따라 사용자의 인증 상태를 확인하고 적절한 페이지로 리디렉션하는 역할을 합니다.
// - 사용자가 로그인하지 않은 상태에서 보호된 페이지(로그인 및 인증 페이지 제외)에 접근하려고 하면 로그인 페이지로 리디렉션합니다.
// - 사용자가 이미 로그인한 상태에서 로그인 페이지에 접근하려고 하면 대시보드로 리디렉션합니다.
// - 그 외의 경우에는 요청을 그대로 진행합니다.
// Next.js 미들웨어는 표준 Web API인 Request와 Response를 확장한 NextRequest와 NextResponse를 사용합니다.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. 미들웨어 함수 내보내기 (이름은 반드시 middleware여야 함)
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

/* 미인증 접근 검사 후 헤더 조작 전달 예시
export function middleware(request: NextRequest) {
  // 1. [B. 인증 단계] : 먼저 차단해야 할 경우를 처리합니다.
  // -------------------------------------------------------
  const token = request.cookies.get('auth-token')
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedPath && !token) {
    // 로그인이 안 되어 있다면 여기서 함수를 즉시 종료(return)합니다.
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. [C. 전달 단계] : 여기까지 왔다면 인증은 통과된 것입니다.
  // -------------------------------------------------------
  
  // 2-1. 기존 요청 헤더를 가져와서 수정할 준비를 합니다.
  // (백엔드나 서버 컴포넌트에 데이터를 전달하기 위함)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-middleware-check', 'success')
  requestHeaders.set('x-user-path', request.nextUrl.pathname)

  // 2-2. NextResponse.next()를 호출할 때 수정된 헤더를 포함시킵니다.
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // 3. [추가 작업] : 브라우저(클라이언트)에게 보낼 쿠키나 헤더 설정
  // -------------------------------------------------------
  // 예: 세션 연장을 위해 쿠키 갱신
  response.cookies.set('last-active', new Date().toISOString())
  // 예: 보안 헤더 추가
  response.headers.set('x-frame-options', 'DENY')

  // 4. 최종적으로 수정된 response 객체 반환
  return response
}
  */

// 2. config 객체 (선택 사항): 미들웨어가 실행될 경로를 지정
// A. 경로 설정 (Matcher)
// 모든 요청에 대해 미들웨어를 실행하면 성능이 저하될 수 있으므로, matcher를 사용하여 특정 경로에서만 실행되도록 설정하는 것이 좋습니다.
export const config = {
  // 단일 경로 또는 배열로 여러 경로 지정 가능
  // /about 하위의 모든 경로, /dashboard 하위의 모든 경로에서 실행
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/login',
    '/',
  ],
}