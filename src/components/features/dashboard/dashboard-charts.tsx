'use client'

import { useCallback, useEffect, useState } from 'react'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
import { getDemandByRegion, getUsersByCity } from '@/services/admin-metrics-fetch'

const usersByCityConfig = {
  total: {
    label: 'Utilizadores',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const demandByRegionConfig = {
  total: {
    label: 'Demanda',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function DashboardCharts() {
  const { token } = useAuth()
  const [cities, setCities] = useState<Array<{ cidade?: string; total?: number }>>([])
  const [regions, setRegions] = useState<Array<{ regiao?: string; total?: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const [citiesRes, regionsRes] = await Promise.all([
        getUsersByCity(token).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { cities: [] }
          throw e
        }),
        getDemandByRegion(token).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { regions: [] }
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
      setCities(Array.isArray(citiesData) ? citiesData : [])
      setRegions(Array.isArray(regionsData) ? regionsData : [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar gráficos')
      setCities([])
      setRegions([])
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded bg-primary/10" />
            <div className="h-4 w-56 animate-pulse rounded bg-primary/5" />
          </CardHeader>
          <CardContent>
            <div className="h-[240px] animate-pulse rounded-lg bg-primary/5" />
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded bg-primary/10" />
            <div className="h-4 w-56 animate-pulse rounded bg-primary/5" />
          </CardHeader>
          <CardContent>
            <div className="h-[240px] animate-pulse rounded-lg bg-primary/5" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasCities = citiesChartData.length > 0
  const hasRegions = regionsChartData.length > 0

  if (!hasCities && !hasRegions) {
    return null
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
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
