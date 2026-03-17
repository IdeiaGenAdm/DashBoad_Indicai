'use client'

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
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo, {nome}</CardTitle>
          <CardDescription>
            Você está autenticado. Em breve mais funcionalidades estarão disponíveis aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Este é o painel principal do dashboard. Navegue pelo menu lateral para acessar outras
            seções.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
