'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiJson } from '@/lib/api';

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

type Alert = {
  id: string;
  symbol: string;
  direction: 'up' | 'down';
  targetPrice: number;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ExistsResponse = { exists: boolean };

type LogoutResponse = { lastLogout?: string | null };

type CurrentUser = { role?: string };

export default function AdminPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
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

  const [newUser, setNewUser] = useState({
    provider: 'google',
    providerId: '',
    email: '',
    name: '',
    role: 'user' as 'user' | 'admin',
    status: 'active' as 'active' | 'suspended',
    picture: '',
  });

  const [alertForm, setAlertForm] = useState({
    symbol: '',
    name: '',
    direction: 'up' as 'up' | 'down',
    targetPrice: '',
  });

  const [stockQuery, setStockQuery] = useState('');

  const fetchJson = useCallback(
    async <T,>(path: string, init?: RequestInit) => {
      setError(null);
      return apiJson<T>(path, {
        ...init,
        headers: {
          ...headers,
          ...(init?.headers || {}),
        },
      });
    },
    [headers],
  );

  const loadCurrentUser = useCallback(async () => {
    if (!API_URL) return;
    try {
      const data = await fetchJson<CurrentUser>('/auth/me', { method: 'GET' });
      setCurrentUser(data);
    } catch {
      setCurrentUser(null);
      router.replace('/login');
    }
  }, [fetchJson, router]);

  const checkAdminExists = useCallback(async () => {
    if (!API_URL) return;
    try {
      const data = await fetchJson<ExistsResponse>('/users/admin/exists', { method: 'GET' });
      setAdminExists(Boolean(data?.exists));
    } catch {
      setAdminExists(null);
    }
  }, [fetchJson, router]);

  const loadUsers = useCallback(async () => {
    if (!API_URL) return;
    setLoadingUsers(true);
    try {
      const data = await fetchJson<UserRow[]>('/users');
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [fetchJson, router]);

  const loadAlerts = useCallback(async () => {
    if (!API_URL) return;
    setLoadingAlerts(true);
    try {
      const data = await fetchJson<Alert[]>('/stocks/alerts');
      setAlerts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingAlerts(false);
    }
  }, [fetchJson, router]);

  const loadStocks = useCallback(
    async (q?: string) => {
      if (!API_URL) return;
      setLoadingStocks(true);
      try {
        const qs = q ? `?q=${encodeURIComponent(q)}` : '';
        const data = await fetchJson<Stock[]>(`/stocks${qs}`);
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
      const data = await fetchJson<LogoutResponse>('/users/me/logout');
      setLastLogout(data.lastLogout ?? null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [fetchJson, router]);

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
      setError('providerId, email, name are required.');
      return;
    }
    try {
      await fetchJson<UserRow>('/users', {
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
    if (!confirm('Delete this user?')) return;
    try {
      await fetchJson<void>(`/users/${id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAddAlert = async () => {
    if (!alertForm.symbol || !alertForm.targetPrice) {
      setError('symbol and targetPrice are required.');
      return;
    }
    try {
      await fetchJson<Alert>('/stocks/alerts', {
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
      loadStocks(stockQuery);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleRemoveAlert = async (id: string) => {
    if (!confirm('Delete this alert?')) return;
    try {
      await fetchJson<void>(`/stocks/alerts/${id}`, { method: 'DELETE' });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleBootstrapAdmin = async () => {
    try {
      await fetchJson<void>('/users/admin/bootstrap/self', {
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
            <p className="text-sm text-slate-400">Admin console</p>
            <h1 className="text-2xl font-semibold">Stock Admin</h1>
          </div>
          <div className="text-right text-sm text-slate-300 space-y-1">
            <p>Last logout: {lastLogout ? new Date(lastLogout).toLocaleString() : 'N/A'}</p>
            {currentUser?.role && <p>Role: {currentUser.role}</p>}
            {error && <p className="text-red-400 mt-1">Error: {error}</p>}
          </div>
        </header>

        {adminExists === false && (
          <Card className="bg-amber-50 text-slate-900 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg">Create first admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700">
                No admin account exists. Bootstrap the current account as admin.
              </p>
              <Button onClick={handleBootstrapAdmin} className="w-full md:w-auto">
                Bootstrap admin
              </Button>
            </CardContent>
          </Card>
        )}

        {adminExists && currentUser && currentUser.role !== 'admin' && (
          <Card className="bg-red-950 border-red-800 text-red-100">
            <CardHeader>
              <CardTitle className="text-lg">Access denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Admin permissions are required.</p>
            </CardContent>
          </Card>
        )}

        {adminExists && currentUser?.role === 'admin' && (
          <>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">User management</CardTitle>
                <Button variant="outline" size="sm" onClick={loadUsers} disabled={loadingUsers}>
                  {loadingUsers ? 'Loading...' : 'Reload'}
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
                    Create user
                  </Button>
                </div>

                <div className="overflow-auto rounded border border-slate-800">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Role</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Last login</th>
                        <th className="px-3 py-2 text-left">Last logout</th>
                        <th className="px-3 py-2 text-left">Actions</th>
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
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td className="px-3 py-4 text-center text-slate-400" colSpan={7}>
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">Stock list</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="symbol or name"
                      value={stockQuery}
                      onChange={(e) => setStockQuery(e.target.value)}
                    />
                    <Button onClick={() => loadStocks(stockQuery)} disabled={loadingStocks}>
                      Search
                    </Button>
                  </div>
                  <div className="max-h-72 overflow-auto border border-slate-800 rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="px-3 py-2 text-left">Symbol</th>
                          <th className="px-3 py-2 text-left">Name</th>
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
                              No stocks found.
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
                  <CardTitle className="text-lg">Alert settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input
                      placeholder="symbol"
                      value={alertForm.symbol}
                      onChange={(e) => setAlertForm({ ...alertForm, symbol: e.target.value })}
                    />
                    <Input
                      placeholder="name (optional)"
                      value={alertForm.name}
                      onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })}
                    />
                    <Input
                      placeholder="target price"
                      value={alertForm.targetPrice}
                      onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                    />
                    <Input
                      placeholder="direction (up/down)"
                      value={alertForm.direction}
                      onChange={(e) =>
                        setAlertForm({
                          ...alertForm,
                          direction: e.target.value === 'down' ? 'down' : 'up',
                        })
                      }
                    />
                    <Button className="md:col-span-2" onClick={handleAddAlert} disabled={loadingAlerts}>
                      Create alert
                    </Button>
                  </div>

                  <div className="max-h-72 overflow-auto border border-slate-800 rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="px-3 py-2 text-left">Symbol</th>
                          <th className="px-3 py-2 text-left">Direction</th>
                          <th className="px-3 py-2 text-left">Target</th>
                          <th className="px-3 py-2 text-left">Created</th>
                          <th className="px-3 py-2 text-left">Actions</th>
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
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {alerts.length === 0 && (
                          <tr>
                            <td className="px-3 py-4 text-center text-slate-400" colSpan={5}>
                              No alerts found.
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
