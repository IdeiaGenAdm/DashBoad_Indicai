'use client'

import { useEffect, useState } from 'react'

import { Briefcase, Building2, Star, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { getOverviewMetrics } from '@/services/admin-metrics-fetch'

export function MetricsCards() {
  const { token } = useAuth()
  const [overview, setOverview] = useState<Record<string, number> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    getOverviewMetrics(token)
      .catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) return null
        throw e
      })
      .then((ov) => {
        setOverview(ov as Record<string, number>)
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'Erro ao carregar métricas')
      })
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-primary/10" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-primary/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const profissionaisCount = overview?.profissionais ?? 0
  const empresasCount = overview?.empresas ?? 0
  const clientesCount = overview?.clientes ?? 0
  const avaliacoesCount = overview?.avaliacoes ?? 0
  const totalByTypes = profissionaisCount + empresasCount + clientesCount
  const usersCount =
    typeof overview?.users === 'number' && overview.users > 0
      ? overview.users
      : typeof overview?.total === 'number' && overview.total > 0
        ? overview.total
        : totalByTypes

  const kpiCards = [
    {
      label: 'Utilizadores',
      value: usersCount,
      desc: 'Total de contas registadas',
      icon: Users,
    },
    {
      label: 'Profissionais',
      value: profissionaisCount,
      desc: 'Profissionais ativos',
      icon: Briefcase,
    },
    {
      label: 'Empresas',
      value: empresasCount,
      desc: 'Empresas registadas',
      icon: Building2,
    },
    {
      label: 'Clientes',
      value: clientesCount,
      desc: 'Clientes na plataforma',
      icon: Users,
    },
    {
      label: 'Avaliações',
      value: avaliacoesCount,
      desc: 'Total de avaliações',
      icon: Star,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card
            key={kpi.label}
            className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20">
                <Icon className="size-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{kpi.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.desc}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
