import { Suspense } from 'react'

import { BarChart3, LayoutDashboard, Shield } from 'lucide-react'

import { LoginForm } from '@/components/auth/login/login-form'
import { Card, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 items-stretch lg:grid-cols-2">
      {/* Card esquerdo — Branding */}
      <Card className="overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent">
        <CardContent className="flex flex-col justify-center p-8 lg:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary/20 dark:bg-primary/30">
              <LayoutDashboard className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">IndicAI Admin</p>
            </div>
          </div>
          <h2 className="mb-2 text-lg font-semibold">Painel administrativo</h2>
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Aceda ao centro de controlo da plataforma IndicAI. Gerir utilizadores, profissionais,
            avaliações e relatórios num único lugar.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="size-4 text-primary" />
              <span>Acesso restrito</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="size-4 text-primary" />
              <span>Métricas em tempo real</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card direito — Formulário */}
      <Suspense
        fallback={
          <Card className="flex min-h-[400px] items-center justify-center border-0">
            <div className="h-64 w-80 animate-pulse rounded-lg bg-muted" />
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
