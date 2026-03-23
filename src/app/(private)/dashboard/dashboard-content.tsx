'use client'

import { MetricsCards } from '@/components/features/dashboard/metrics-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export function DashboardContent() {
  const { user } = useAuth()

  const nome = (user?.nomeCompleto ?? user?.nome ?? 'Usuário') as string

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao Dashboard IndicAI</p>
      </div>
      <MetricsCards />
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo, {nome}</CardTitle>
          <CardDescription>
            Você está autenticado. Navegue pelo menu lateral para acessar outras seções.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este é o painel principal do dashboard. Consulta métricas, utilizadores e relatórios nas
            páginas correspondentes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
