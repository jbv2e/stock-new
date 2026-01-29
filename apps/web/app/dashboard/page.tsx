'use client'
import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";

type User = {
  userId: string;
  email: string;
  role: string;
  status: string;
  lastLogout?: string | null;
};

type BalanceResponse = {
  cash: number;
  stocks: Array<{
    symbol: string;
    quantity: number;
    avgPrice: number;
  }>;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);

  const loadBalance = useCallback( async () => {
    try {
      const data = await apiJson<BalanceResponse>('/brokers/KIS/balance', { method: 'GET' });
      setBalance(data);
    } catch (error) {
      console.log(error);
    }
  }, [])
  
  useEffect(() => {
    console.log(`process url : ${process.env.NEXT_PUBLIC_API_URL}`)
    const userFetch = async () => {
      try {
        const data = await apiJson<User>('/auth/me', {
          method: 'GET',
          cache: 'no-store',
        });
        setUser(data);
        console.log(data)
      } catch (error) {
        console.log(error);
        setUser(null);
        router.replace('/login');
      }
    }
    userFetch();

    return () => {  
      // userFetch();
    }
  }, [router])
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>Logged in</p>
      {/* <span>{user.name}-{user.email}</span> */}
      <span>{JSON.stringify(user)}</span>
       <button
        className="mt-4 rounded border px-3 py-1"
        onClick={loadBalance}
      >
        KIS Balance
      </button>

      <pre className="mt-4 text-xs">
        {JSON.stringify(balance, null, 2)}
      </pre>
    </div>
  )
}
