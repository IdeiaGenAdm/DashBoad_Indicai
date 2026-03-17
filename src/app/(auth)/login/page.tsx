import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="text-2xl font-bold">Dashboard IndicAI</h1>
      <LoginForm />
    </div>
  )
}
