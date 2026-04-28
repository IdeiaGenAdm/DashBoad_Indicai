'use client'

import { useCallback, useEffect, useState } from 'react'

import { BarChart3, DollarSign, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import {
  type FinancialReportItem,
  type PlanStatsResponse,
  getFinancialReport,
  getPlanStats,
} from '@/services/admin-metrics-fetch'

import { DateRangeFilter } from './date-range-filter'

const chartConfig = {
  receita: {
    label: 'Receita',
    color: 'hsl(var(--chart-1))',
  },
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-2))',
  },
  profissionais: {
    label: 'Profissionais',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export function FinancialReport() {
  const { token } = useAuth()
  const [periodo, setPeriodo] = useState('')
  const [plano, setPlano] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [report, setReport] = useState<FinancialReportItem[] | null>(null)
  const [planStats, setPlanStats] = useState<{ plano?: string; total?: number }[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const [reportRes, plansRes] = await Promise.all([
        getFinancialReport(token, {
          periodo: periodo || undefined,
          plano: plano || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { report: [] }
          throw e
        }),
        getPlanStats(token, {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }).catch((e) => {
          if (e instanceof AdminApiError && e.status === 403) return { plans: [] }
          throw e
        }),
      ])
      const reportList =
        reportRes.report ?? (reportRes as { data?: FinancialReportItem[] }).data ?? []
      setReport(Array.isArray(reportList) ? reportList : [])
      const plansResTyped = plansRes as PlanStatsResponse & {
        data?: { plano?: string; total?: number }[]
      }
      const plans = plansResTyped.plans ?? plansResTyped.stats ?? plansResTyped.data ?? []
      setPlanStats(Array.isArray(plans) ? plans : [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar relatório')
      setReport(null)
      setPlanStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [token, periodo, plano, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalReceita = report?.reduce((acc, i) => acc + (Number(i.receita) || 0), 0) ?? 0
  const totalProfissionais =
    report?.reduce((acc, i) => acc + (Number(i.profissionais) || 0), 0) ?? 0

  const chartData =
    report
      ?.filter((i) => (i.plano ?? i.periodo) != null)
      .map((i) => ({
        name: (i.plano ?? i.periodo ?? 'N/A') as string,
        receita: Number(i.receita) || 0,
        total: Number(i.total) || 0,
        profissionais: Number(i.profissionais) || 0,
      })) ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="size-5" />
            Relatório financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          </div>
          <LoadingSkeleton variant="cards" rowCount={4} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="size-5" />
          Relatório financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Select value={periodo || 'all'} onValueChange={(v) => setPeriodo(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={plano || 'all'} onValueChange={(v) => setPlano(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planos</SelectItem>
              {planStats?.map((p, i) =>
                typeof p.plano === 'string' ? (
                  <SelectItem key={i} value={p.plano}>
                    {p.plano}
                  </SelectItem>
                ) : null
              )}
            </SelectContent>
          </Select>
        </div>

        {(!report || report.length === 0) && !planStats?.length ? (
          <EmptyState icon={TrendingUp} message="Sem dados financeiros disponíveis." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita total</CardTitle>
                  <DollarSign className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalReceita.toLocaleString('pt-PT', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
                  <BarChart3 className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProfissionais}</div>
                </CardContent>
              </Card>
            </div>

            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="receita" fill="var(--color-receita)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : null}

            {report && report.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Detalhe por plano/período</h4>
                <div className="space-y-1 rounded-xl">
                  {report.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-muted/40 p-3 dark:bg-muted/20"
                    >
                      <span className="font-medium capitalize">
                        {item.plano ?? item.periodo ?? 'N/A'}
                      </span>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {typeof item.receita === 'number' && (
                          <span>
                            {item.receita.toLocaleString('pt-PT', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </span>
                        )}
                        {typeof item.profissionais === 'number' && (
                          <span>{item.profissionais} profissionais</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
