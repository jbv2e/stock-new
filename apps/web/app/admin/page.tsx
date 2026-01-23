'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  lastLogin?: string | null;
  lastLogout?: string | null;
  provider: string;
  providerId: string;
  picture?: string | null;
};

type Stock = { symbol: string; name: string };
type Alert = { id: string; symbol: string; direction: 'up' | 'down'; targetPrice: number; createdAt: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<{ role?: string } | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastLogout, setLastLogout] = useState<string | null>(null);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(() => ({ 'Content-Type': 'application/json' }), []);

  // 신규 사용자 생성 폼
  const [newUser, setNewUser] = useState({
    provider: 'google',
    providerId: '',
    email: '',
    name: '',
    role: 'user' as 'user' | 'admin',
    status: 'active' as 'active' | 'suspended',
    picture: '',
  });

  // 알림 등록 폼
  const [alertForm, setAlertForm] = useState({
    symbol: '',
    name: '',
    direction: 'up' as 'up' | 'down',
    targetPrice: '',
  });

  const [stockQuery, setStockQuery] = useState('');

  const fetchJson = useCallback(
    async (path: string, init?: RequestInit) => {
      setError(null);
      const res = await fetch(`${API_URL}${path}`, {
        ...init,
        credentials: 'include', // 인증 쿠키 포함
        headers: {
          ...headers,
          ...(init?.headers || {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      return res.json();
    },
    [headers],
  );

  const loadCurrentUser = useCallback(async () => {
    if (!API_URL) return;
    try {
      const data = await fetchJson('/auth/me', { method: 'GET' });
      setCurrentUser(data);
    } catch {
      setCurrentUser(null);
    }
  }, [fetchJson]);

  const checkAdminExists = useCallback(async () => {
    if (!API_URL) return;
    try {
      const data = await fetchJson('/users/admin/exists', { method: 'GET' });
      setAdminExists(Boolean(data?.exists));
    } catch {
      setAdminExists(null);
    }
  }, [fetchJson]);

  const loadUsers = useCallback(async () => {
    if (!API_URL) return;
    setLoadingUsers(true);
    try {
      const data = await fetchJson('/users');
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [fetchJson]);

  const loadAlerts = useCallback(async () => {
    if (!API_URL) return;
    setLoadingAlerts(true);
    try {
      const data = await fetchJson('/stocks/alerts');
      setAlerts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingAlerts(false);
    }
  }, [fetchJson]);

  const loadStocks = useCallback(
    async (q?: string) => {
      if (!API_URL) return;
      setLoadingStocks(true);
      try {
        const qs = q ? `?q=${encodeURIComponent(q)}` : '';
        const data = await fetchJson(`/stocks${qs}`);
        setStocks(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingStocks(false);
      }
    },
    [fetchJson],
  );

  const loadMyLastLogout = useCallback(async () => {
    if (!API_URL) return;
    try {
      const data = await fetchJson('/users/me/logout');
      setLastLogout(data.lastLogout ?? null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [fetchJson]);

  useEffect(() => {
    checkAdminExists();
    loadCurrentUser();
    loadUsers();
    loadAlerts();
    loadStocks();
    loadMyLastLogout();
  }, [checkAdminExists, loadCurrentUser, loadUsers, loadAlerts, loadStocks, loadMyLastLogout]);

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.providerId) {
      setError('providerId, email, name은 필수입니다.');
      return;
    }
    try {
      await fetchJson('/users', {
        method: 'POST',
        body: JSON.stringify({
          ...newUser,
          picture: newUser.picture || null,
        }),
      });
      setNewUser({
        provider: 'google',
        providerId: '',
        email: '',
        name: '',
        role: 'user',
        status: 'active',
        picture: '',
      });
      loadUsers();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetchJson(`/users/${id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAddAlert = async () => {
    if (!alertForm.symbol || !alertForm.targetPrice) {
      setError('symbol과 targetPrice는 필수입니다.');
      return;
    }
    try {
      await fetchJson('/stocks/alerts', {
        method: 'POST',
        body: JSON.stringify({
          symbol: alertForm.symbol,
          name: alertForm.name || undefined,
          direction: alertForm.direction,
          targetPrice: Number(alertForm.targetPrice),
        }),
      });
      setAlertForm({ symbol: '', name: '', direction: 'up', targetPrice: '' });
      loadAlerts();
      loadStocks(stockQuery); // 종목 목록도 새로고침
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleRemoveAlert = async (id: string) => {
    if (!confirm('알림을 삭제하시겠습니까?')) return;
    try {
      await fetchJson(`/stocks/alerts/${id}`, { method: 'DELETE' });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleBootstrapAdmin = async () => {
    try {
      await fetchJson('/users/admin/bootstrap/self', {
        method: 'POST',
      });
      checkAdminExists();
      loadUsers();
      loadCurrentUser();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">관리자 전용 콘솔</p>
            <h1 className="text-2xl font-semibold">Stock Admin</h1>
          </div>
          <div className="text-right text-sm text-slate-300 space-y-1">
            <p>최근 로그아웃: {lastLogout ? new Date(lastLogout).toLocaleString() : '기록 없음'}</p>
            {currentUser?.role && <p>내 역할: {currentUser.role}</p>}
            {error && <p className="text-red-400 mt-1">에러: {error}</p>}
          </div>
        </header>

        {/* 관리자 없음: 부트스트랩 섹션 */}
        {adminExists === false && (
          <Card className="bg-amber-50 text-slate-900 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg">첫 관리자 계정 생성</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700">
                현재 관리자 계정이 없습니다. 구글 등으로 로그인한 현재 계정을 관리자 권한으로 승격합니다.
              </p>
              <Button onClick={handleBootstrapAdmin} className="w-full md:w-auto">
                내 계정을 관리자 등록
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 권한 없음 표시 */}
        {adminExists && currentUser && currentUser.role !== 'admin' && (
          <Card className="bg-red-950 border-red-800 text-red-100">
            <CardHeader>
              <CardTitle className="text-lg">권한 없음</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>관리자 권한이 없어 접근할 수 없습니다.</p>
            </CardContent>
          </Card>
        )}

        {/* 관리자 UI */}
        {adminExists && currentUser?.role === 'admin' && (
          <>
            {/* 사용자 관리 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">사용자 관리</CardTitle>
                <Button variant="outline" size="sm" onClick={loadUsers} disabled={loadingUsers}>
                  {loadingUsers ? '새로고침...' : '새로고침'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    placeholder="providerId"
                    value={newUser.providerId}
                    onChange={(e) => setNewUser({ ...newUser, providerId: e.target.value })}
                  />
                  <Input
                    placeholder="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                  <Input
                    placeholder="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                  <Input
                    placeholder="role (user/admin)"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value === 'admin' ? 'admin' : 'user',
                      })
                    }
                  />
                  <Input
                    placeholder="status (active/suspended)"
                    value={newUser.status}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        status: e.target.value === 'suspended' ? 'suspended' : 'active',
                      })
                    }
                  />
                  <Input
                    placeholder="picture (optional)"
                    value={newUser.picture}
                    onChange={(e) => setNewUser({ ...newUser, picture: e.target.value })}
                  />
                  <Button className="md:col-span-3" onClick={handleCreateUser}>
                    사용자 추가
                  </Button>
                </div>

                <div className="overflow-auto rounded border border-slate-800">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="px-3 py-2 text-left">이름</th>
                        <th className="px-3 py-2 text-left">이메일</th>
                        <th className="px-3 py-2 text-left">역할</th>
                        <th className="px-3 py-2 text-left">상태</th>
                        <th className="px-3 py-2 text-left">최근 로그인</th>
                        <th className="px-3 py-2 text-left">최근 로그아웃</th>
                        <th className="px-3 py-2 text-left">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-t border-slate-800">
                          <td className="px-3 py-2">{u.name}</td>
                          <td className="px-3 py-2">{u.email}</td>
                          <td className="px-3 py-2">{u.role}</td>
                          <td className="px-3 py-2">{u.status}</td>
                          <td className="px-3 py-2">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}
                          </td>
                          <td className="px-3 py-2">
                            {u.lastLogout ? new Date(u.lastLogout).toLocaleString() : '-'}
                          </td>
                          <td className="px-3 py-2">
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)}>
                              삭제
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td className="px-3 py-4 text-center text-slate-400" colSpan={7}>
                            사용자 데이터가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 알림 관리 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">종목 목록</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="심볼/이름 검색"
                      value={stockQuery}
                      onChange={(e) => setStockQuery(e.target.value)}
                    />
                    <Button onClick={() => loadStocks(stockQuery)} disabled={loadingStocks}>
                      검색
                    </Button>
                  </div>
                  <div className="max-h-72 overflow-auto border border-slate-800 rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="px-3 py-2 text-left">심볼</th>
                          <th className="px-3 py-2 text-left">이름</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stocks.map((s) => (
                          <tr key={s.symbol} className="border-t border-slate-800">
                            <td className="px-3 py-2">{s.symbol}</td>
                            <td className="px-3 py-2">{s.name}</td>
                          </tr>
                        ))}
                        {stocks.length === 0 && (
                          <tr>
                            <td className="px-3 py-4 text-center text-slate-400" colSpan={2}>
                              종목 데이터가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">알림 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input
                      placeholder="심볼 (필수)"
                      value={alertForm.symbol}
                      onChange={(e) => setAlertForm({ ...alertForm, symbol: e.target.value })}
                    />
                    <Input
                      placeholder="종목명 (없으면 빈칸)"
                      value={alertForm.name}
                      onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })}
                    />
                    <Input
                      placeholder="목표가 (필수, 숫자)"
                      value={alertForm.targetPrice}
                      onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                    />
                    <Input
                      placeholder="방향 up/down"
                      value={alertForm.direction}
                      onChange={(e) =>
                        setAlertForm({
                          ...alertForm,
                          direction: e.target.value === 'down' ? 'down' : 'up',
                        })
                      }
                    />
                    <Button className="md:col-span-2" onClick={handleAddAlert} disabled={loadingAlerts}>
                      알림 추가
                    </Button>
                  </div>

                  <div className="max-h-72 overflow-auto border border-slate-800 rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="px-3 py-2 text-left">심볼</th>
                          <th className="px-3 py-2 text-left">방향</th>
                          <th className="px-3 py-2 text-left">목표가</th>
                          <th className="px-3 py-2 text-left">등록</th>
                          <th className="px-3 py-2 text-left">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alerts.map((a) => (
                          <tr key={a.id} className="border-t border-slate-800">
                            <td className="px-3 py-2">{a.symbol}</td>
                            <td className="px-3 py-2">{a.direction}</td>
                            <td className="px-3 py-2">{a.targetPrice}</td>
                            <td className="px-3 py-2">
                              {a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}
                            </td>
                            <td className="px-3 py-2">
                              <Button variant="destructive" size="sm" onClick={() => handleRemoveAlert(a.id)}>
                                삭제
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {alerts.length === 0 && (
                          <tr>
                            <td className="px-3 py-4 text-center text-slate-400" colSpan={5}>
                              등록된 알림이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
