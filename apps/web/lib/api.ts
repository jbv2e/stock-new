const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RetryOptions = {
  retry?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

const requireApiUrl = () => {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return API_URL;
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') {
    return;
  }
  if (window.location.pathname === '/login') {
    return;
  }
  window.location.replace('/login');
};

const startRefresh = async (): Promise<boolean> => {
  
  const baseUrl = requireApiUrl();
  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    return false;
  }
  // The API sets cookies; body is optional.
  return true;
};

export const refreshAccessToken = async (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = startRefresh();
    refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export const apiFetch = async (
  path: string, // e.g., '/auth/me'
  init: RequestInit = {}, // e.g., { method: 'GET' }
  options: RetryOptions = {}, // e.g., { retry: true }
): Promise<Response> => { // Response 객체 반환
  const baseUrl = requireApiUrl(); // 환경변수(.env)에서 API URL 가져오기
  // 1. 기본 API 호출
  const res = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',  // ★★★ 중요: 쿠키를 요청에 자동으로 포함시키는 옵션
    ...init,
    headers: {
      ...(init.headers || {}),
    },
  }); // API 호출

  //debugger

  // 2. 401이 아닌 경우, 응답 반환
  if (res.status !== 401) {
    return res;
  }

  // 3. 401 Unauthorized 응답 처리
  // 재시도 옵션이 false인 경우, 로그인 페이지로 리다이렉트 - 무한 루프 방지
  if (options.retry === false) {
    redirectToLogin();
    return res;
  }

  // 4. 토큰 재발급 시도
  const refreshed = await refreshAccessToken();

  // 5. 토큰 재발급 실패 시, 로그인 페이지로 리다이렉트
  if (!refreshed) {
    redirectToLogin();
    return res;
  }

   // 6. 토큰 재발급 성공 시, 원래 요청을 다시 시도
   // ★★★ 중요: 이때 retry: false 옵션을 주어 무한 루프를 방지
  return apiFetch(path, init, { retry: false });
};

export const apiJson = async <T>(
  path: string,
  init: RequestInit = {},
  options: RetryOptions = {},
): Promise<T> => {
  const res = await apiFetch(path, init, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};
