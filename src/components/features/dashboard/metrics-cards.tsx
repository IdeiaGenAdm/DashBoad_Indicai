'use client'

import { useEffect, useState } from 'react'

import { BarChart3, Users } from 'lucide-react'
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
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {overview && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilizadores</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.users ?? overview.total ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
              <BarChart3 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.profissionais ?? 0}</div>
            </CardContent>
          </Card>
        </>
      )}
      {comparison && comparison.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comparativo por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparison.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{item.tipo ?? 'N/A'}</span>
                  <span className="font-medium">{item.total ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
