'use client'

import { useCallback, useEffect, useState } from 'react'

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import {
  getAccountMetricsComparison,
  getDemandByRegion,
  getPlanStats,
  getTopProfessions,
  getUsersByCity,
} from '@/services/admin-metrics-fetch'

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#6366f1',
  '#14b8a6',
]

const usersByCityConfig = {
  total: {
    label: 'Utilizadores',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

const demandByRegionConfig = {
  total: {
    label: 'Demanda',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig

const topProfessionsConfig = {
  total: {
    label: 'Pesquisas',
    color: '#22c55e',
  },
} satisfies ChartConfig

const pieChartConfig = {
  value: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function DashboardCharts() {
  const { token } = useAuth()
  const [cities, setCities] = useState<Array<{ cidade?: string; total?: number }>>([])
  const [regions, setRegions] = useState<Array<{ regiao?: string; total?: number }>>([])
  const [accountComparison, setAccountComparison] = useState<
    Array<{ name: string; value: number }>
  >([])
  const [planStats, setPlanStats] = useState<Array<{ name: string; value: number }>>([])
  const [topProfessions, setTopProfessions] = useState<Array<{ name: string; total: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const [citiesRes, regionsRes, comparisonRes, plansRes, professionsRes] = await Promise.all([
        getUsersByCity(token).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { cities: [] }
          throw e
        }),
        getDemandByRegion(token).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { regions: [] }
          throw e
        }),
        getAccountMetricsComparison(token).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { comparison: [] }
          throw e
        }),
        getPlanStats(token).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { plans: [] }
          throw e
        }),
        getTopProfessions(token).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { professions: [] }
          throw e
        }),
      ])

      const citiesData =
        citiesRes.cities ??
        (citiesRes as { data?: Array<{ cidade?: string; total?: number }> }).data ??
        []
      const regionsData =
        regionsRes.regions ??
        (regionsRes as { data?: Array<{ regiao?: string; total?: number }> }).data ??
        []
      const comparisonData =
        comparisonRes.comparison ??
        (comparisonRes as { data?: Array<{ tipo?: string; total?: number }> }).data ??
        []
      const plansResTyped = plansRes as {
        plans?: Array<{ plano?: string; total?: number }>
        stats?: Array<{ plano?: string; total?: number }>
        data?: Array<{ plano?: string; total?: number }>
      }
      const plansData = plansResTyped.plans ?? plansResTyped.stats ?? plansResTyped.data ?? []
      const professionsResTyped = professionsRes as {
        professions?: Array<{ profissao?: string; nome?: string; total?: number; count?: number }>
        data?: Array<{ profissao?: string; nome?: string; total?: number; count?: number }>
      }
      const professionsData = professionsResTyped.professions ?? professionsResTyped.data ?? []

      setCities(Array.isArray(citiesData) ? citiesData : [])
      setRegions(Array.isArray(regionsData) ? regionsData : [])
      setAccountComparison(
        (Array.isArray(comparisonData) ? comparisonData : [])
          .filter((i) => Number(i.total) > 0)
          .map((i) => ({
            name: String(i.tipo ?? 'N/A'),
            value: Number(i.total) || 0,
          }))
      )
      setPlanStats(
        (Array.isArray(plansData) ? plansData : [])
          .filter((i) => Number(i.total) > 0)
          .map((i) => ({
            name: String(i.plano ?? 'N/A'),
            value: Number(i.total) || 0,
          }))
      )
      setTopProfessions(
        (Array.isArray(professionsData) ? professionsData : []).slice(0, 8).map((i) => ({
          name: String(i.profissao ?? i.nome ?? 'N/A'),
          total: Number(i.total ?? i.count) || 0,
        }))
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar gráficos')
      setCities([])
      setRegions([])
      setAccountComparison([])
      setPlanStats([])
      setTopProfessions([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const citiesChartData = cities
    .slice(0, 8)
    .map((c) => ({ name: c.cidade ?? 'N/A', total: Number(c.total) || 0 }))
  const regionsChartData = regions
    .slice(0, 8)
    .map((r) => ({ name: r.regiao ?? 'N/A', total: Number(r.total) || 0 }))

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-md">
            <CardHeader>
              <div className="h-6 w-40 animate-pulse rounded bg-primary/10" />
              <div className="h-4 w-56 animate-pulse rounded bg-primary/5" />
            </CardHeader>
            <CardContent>
              <div className="h-[240px] animate-pulse rounded-lg bg-primary/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const hasCities = citiesChartData.length > 0
  const hasRegions = regionsChartData.length > 0
  const hasAccount = accountComparison.length > 0
  const hasPlans = planStats.length > 0
  const hasProfessions = topProfessions.length > 0

  if (!hasCities && !hasRegions && !hasAccount && !hasPlans && !hasProfessions) {
    return null
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {hasAccount && (
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader>
            <CardTitle>Distribuição por tipo de conta</CardTitle>
            <CardDescription>Utilizadores por tipo de conta</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[240px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={accountComparison}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {accountComparison.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
      {hasPlans && (
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader>
            <CardTitle>Utilizadores por plano</CardTitle>
            <CardDescription>Distribuição de utilizadores por plano</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[240px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={planStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {planStats.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
      {hasProfessions && (
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader>
            <CardTitle>Profissões mais buscadas</CardTitle>
            <CardDescription>Top profissões com mais pesquisas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topProfessionsConfig} className="h-[240px] w-full">
              <BarChart
                data={topProfessions}
                layout="vertical"
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
      {hasCities && (
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader>
            <CardTitle>Utilizadores por cidade</CardTitle>
            <CardDescription>Top 8 cidades com mais utilizadores registados</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={usersByCityConfig} className="h-[240px] w-full">
              <BarChart data={citiesChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
      {hasRegions && (
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader>
            <CardTitle>Demanda por região</CardTitle>
            <CardDescription>Top 8 regiões com maior demanda</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={demandByRegionConfig} className="h-[240px] w-full">
              <BarChart data={regionsChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
