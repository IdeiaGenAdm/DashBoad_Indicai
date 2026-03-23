import { Suspense } from 'react'

import { LoginForm } from '@/components/auth/login/login-form'

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="text-2xl font-bold">Dashboard Admin IndicAI</h1>
      <Suspense
        fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-lg bg-muted" />}
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
