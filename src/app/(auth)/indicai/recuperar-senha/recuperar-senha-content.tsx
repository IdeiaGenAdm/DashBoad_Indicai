'use client'

import { useSearchParams } from 'next/navigation'

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export function RecuperarSenhaContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="text-2xl font-bold">Dashboard IndicAI</h1>
      {token ? <ResetPasswordForm token={token} /> : <ForgotPasswordForm />}
    </div>
  )
}
