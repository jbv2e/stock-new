'use client'
import { useCallback, useEffect, useState } from "react";


export default function DashboardPage() {

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState<any>(null);

  const loadBalance = async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brokers/KIS/balance`,
          {
            method: 'GET',
            credentials: 'include', // ✅ 쿠키 전송
          },
        );
        const data = await res.json();
        setBalance(data);
  };
  
  useEffect(() => {
    try {
      console.log(`process url : ${process.env.NEXT_PUBLIC_API_URL}`)
      const userFetch = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include', // 쿠키 자동 전송
        });
        const data = await res.json();
        setUser(data);
      }

      

      userFetch();
    }
    catch (error) {
      console.log(error);
    }

    return () => {  
      // userFetch();
    }
  }, [])
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>로그인 성공 🎉</p>
      {/* <span>{user.name}-{user.email}</span> */}
      <span>{JSON.stringify(user)}</span>
       <button
        className="mt-4 rounded border px-3 py-1"
        onClick={loadBalance}
      >
        KIS 잔고 조회
      </button>

      <pre className="mt-4 text-xs">
        {JSON.stringify(balance, null, 2)}
      </pre>
    </div>
  )
}
