'use client'

import { LayoutDashboard } from 'lucide-react'

import { DashboardCharts } from '@/components/features/dashboard/dashboard-charts'
import { MetricsCards } from '@/components/features/dashboard/metrics-cards'
import { QuickActions } from '@/components/features/dashboard/quick-actions'
import { RecentUsersTable } from '@/components/features/dashboard/recent-users-table'
import { TopRatedTable } from '@/components/features/dashboard/top-rated-table'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardContent() {
  const { user } = useAuth()

  const nome = (user?.nomeCompleto ?? user?.nome ?? '') as string
  const primeiroNome = nome.trim().split(' ')[0] ?? ''

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 pb-2">
        <div className="flex shrink-0 items-center justify-center rounded-xl bg-primary/20 p-3">
          <LayoutDashboard className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Resumo geral da aplicação IndicAI</p>
        </div>
      </div>

      <Card className="overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent shadow-md dark:from-primary/20 dark:via-primary/10 dark:to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/30 text-lg font-bold text-primary">
              {primeiroNome ? primeiroNome[0]!.toUpperCase() : 'A'}
            </div>
            <div>
              <CardTitle className="text-xl">
                {getGreeting()}
                {primeiroNome ? `, ${primeiroNome}` : ''}!
              </CardTitle>
              <CardDescription className="mt-1">
                Aqui está o resumo da plataforma IndicAI. Navegue pelas secções para gerir
                utilizadores, profissionais, avaliações e muito mais.
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuickActions />

      <MetricsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentUsersTable />
        <TopRatedTable />
      </div>

      <DashboardCharts />
    </div>
  )
}
