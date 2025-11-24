'use client'

import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const onGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-10 border rounded-xl shadow">
        <h1 className="text-xl font-semibold mb-6">로그인</h1>
        <Button onClick={onGoogleLogin} className="w-64">
          Google 계정으로 로그인
        </Button>
      </div>
    </div>
  )
}
