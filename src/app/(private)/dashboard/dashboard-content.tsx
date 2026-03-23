'use client'

import { useState } from 'react'

import { BarChart3, LayoutGrid } from 'lucide-react'

import { DashboardCharts } from '@/components/features/dashboard/dashboard-charts'
import { MetricsCards } from '@/components/features/dashboard/metrics-cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

type ViewMode = 'kpi' | 'charts'

export function DashboardContent() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('kpi')

  const nome = (user?.nomeCompleto ?? user?.nome ?? 'Utilizador') as string

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Resumo geral da aplicação IndicAI</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'kpi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kpi')}
          >
            <LayoutGrid className="mr-1.5 size-4" />
            KPIs
          </Button>
          <Button
            variant={viewMode === 'charts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('charts')}
          >
            <BarChart3 className="mr-1.5 size-4" />
            Gráficos
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent shadow-md dark:from-primary/20 dark:via-primary/10 dark:to-transparent">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-xl">Bem-vindo ao IndicAI</CardTitle>
            <CardDescription className="mt-1">
              Navegue pelo menu lateral para aceder às secções: utilizadores, profissionais,
              avaliações, denúncias, relatórios e configurações do sistema.
            </CardDescription>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'kpi' && <MetricsCards />}
      {viewMode === 'charts' && <DashboardCharts />}
    </div>
  )
}
