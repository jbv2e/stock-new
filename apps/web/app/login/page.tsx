'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api";

type User = {
  userId: string;
  email: string;
  role: string;
  status: string;
  lastLogout?: string | null;
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;
    apiJson<User>('/auth/me', { method: 'GET', cache: 'no-store' })
      .then(() => {
        if (isActive) {
          router.replace('/dashboard');
        }
      })
      .catch(() => {
        // not logged in
      });

    return () => {
      isActive = false;
    };
  }, [router]);

  const onGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-10 border rounded-xl shadow">
        <h1 className="text-xl font-semibold mb-6">Login</h1>
        <Button onClick={onGoogleLogin} className="w-64">
          Login with Google
        </Button>
      </div>
    </div>
  );
}
