'use client'

import { useEffect, useState } from 'react'

import { BarChart3, Briefcase, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { getAccountMetricsComparison, getOverviewMetrics } from '@/services/admin-metrics-fetch'

export function MetricsCards() {
  const { token } = useAuth()
  const [overview, setOverview] = useState<Record<string, number> | null>(null)
  const [comparison, setComparison] = useState<Array<{ tipo?: string; total?: number }> | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([
      getOverviewMetrics(token).catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) return null
        throw e
      }),
      getAccountMetricsComparison(token).catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) return null
        throw e
      }),
    ])
      .then(([ov, comp]) => {
        setOverview(ov as Record<string, number>)
        setComparison(
          (comp as { comparison?: Array<{ tipo?: string; total?: number }> })?.comparison ?? null
        )
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'Erro ao carregar métricas')
      })
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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

  const usersCount = overview?.users ?? overview?.total ?? 0
  const profissionaisCount = overview?.profissionais ?? 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Utilizadores</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20">
            <Users className="size-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{usersCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">Total de contas registadas</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Profissionais</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20">
            <Briefcase className="size-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{profissionaisCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">Profissionais ativos</p>
        </CardContent>
      </Card>

      {comparison && comparison.length > 0 && (
        <Card className="col-span-full overflow-hidden border-0 shadow-md lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comparativo por tipo
            </CardTitle>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20">
              <BarChart3 className="size-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {comparison.slice(0, 4).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2 dark:bg-primary/10"
                >
                  <span className="text-sm capitalize">{item.tipo ?? 'N/A'}</span>
                  <span className="font-semibold text-primary">{item.total ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
