'use client'

import { MetricsCards } from '@/components/features/dashboard/metrics-cards'
import { DashboardCharts } from '@/components/features/dashboard/dashboard-charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export function DashboardContent() {
  const { user } = useAuth()

  const nome = (user?.nomeCompleto ?? user?.nome ?? 'Utilizador') as string

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Bem-vindo ao painel IndicAI</p>
      </div>

      <MetricsCards />

      <DashboardCharts />

      <Card className="overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent shadow-md dark:from-primary/20 dark:via-primary/10 dark:to-transparent">
        <CardHeader>
          <div className="mb-2 flex size-14 items-center justify-center rounded-xl bg-primary/20 dark:bg-primary/30">
            <span className="text-2xl font-bold text-primary">
              {nome
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
          </div>
          <CardTitle className="text-xl">Bem-vindo, {nome}</CardTitle>
          <CardDescription>
            Está autenticado. Navegue pelo menu lateral para aceder às secções: utilizadores,
            profissionais, avaliações, denúncias, relatórios e configurações do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Consulte métricas em tempo real, gerir utilizadores e aceder aos relatórios nas páginas
            correspondentes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
