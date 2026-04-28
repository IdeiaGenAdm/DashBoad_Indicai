'use client'

import { useCallback, useEffect, useState } from 'react'

import { Activity, BarChart3, Plus, Smartphone, Trash2, TrendingUp, Users } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { useAuth } from '@/contexts/auth-context'
import {
  type GrowthReportPoint,
  type ReportDistributionItem,
  type UserGrowthReport,
  getUserGrowthReport,
} from '@/services/admin-metrics-fetch'

import { DateRangeFilter } from './date-range-filter'

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#22c55e',
  '#f97316',
]

const MARKERS_STORAGE_KEY = 'indicme_growth_report_markers'
const MARKER_COLOR = '#111827'

interface ReportMarker {
  id: string
  name: string
  startDate: string
  endDate: string
  visible: boolean
}

type RelationshipFilter = 'Todos' | 'Parentes' | 'Conhecidos' | 'Desconhecido'

function loadMarkers(): ReportMarker[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MARKERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ReportMarker[]
    return Array.isArray(parsed) ? parsed.filter((item) => item.id && item.name) : []
  } catch {
    return []
  }
}

function saveMarkers(markers: ReportMarker[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MARKERS_STORAGE_KEY, JSON.stringify(markers))
}

const evolutionConfig = {
  profissionais: { label: 'Profissionais', color: 'hsl(var(--chart-1))' },
  clientes: { label: 'Clientes', color: 'hsl(var(--chart-2))' },
  total: { label: 'Total', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

const entriesConfig = {
  entradaProfissionais: { label: 'Entrada profissionais', color: 'hsl(var(--chart-1))' },
  entradaClientes: { label: 'Entrada clientes', color: 'hsl(var(--chart-2))' },
  entradaTotal: { label: 'Entrada total', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

const growthConfig = {
  taxaCrescimento: { label: 'Taxa de crescimento (%)', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig

const pieConfig = {
  value: { label: 'Total', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

function StatCard({
  title,
  value,
  description,
}: {
  title: string
  value: string | number
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function ChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-px bg-foreground" />
        Marcadores
      </span>
    </div>
  )
}

function formatDateTick(value: string) {
  const [, month, day] = value.split('-')
  return `${day}/${month}`
}

function MarkerOverlay({ markers }: { markers: ReportMarker[] }) {
  return (
    <>
      {markers
        .filter((marker) => marker.visible && marker.startDate)
        .map((marker) =>
          marker.endDate && marker.endDate !== marker.startDate ? (
            <ReferenceArea
              key={marker.id}
              x1={marker.startDate}
              x2={marker.endDate}
              stroke={MARKER_COLOR}
              strokeOpacity={0.65}
              fill={MARKER_COLOR}
              fillOpacity={0.08}
              label={{
                value: marker.name,
                position: 'insideTop',
                fill: MARKER_COLOR,
                fontSize: 12,
              }}
            />
          ) : (
            <ReferenceLine
              key={marker.id}
              x={marker.startDate}
              stroke={MARKER_COLOR}
              strokeWidth={1.5}
              label={{ value: marker.name, position: 'top', fill: MARKER_COLOR, fontSize: 12 }}
            />
          )
        )}
    </>
  )
}

function DistributionChart({
  title,
  description,
  data,
  icon: Icon,
}: {
  title: string
  description: string
  data: ReportDistributionItem[]
  icon: typeof Smartphone
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="size-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState icon={Icon} message="Sem dados para este grafico." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartLegend
          items={data.map((item, index) => ({
            label: item.name,
            color: PIE_COLORS[index % PIE_COLORS.length],
          }))}
        />
        <ChartContainer config={pieConfig} className="h-[260px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function latestIndices(data: GrowthReportPoint[]) {
  return data.slice(-7).reverse()
}

export function GrowthReport() {
  const { token } = useAuth()
  const [report, setReport] = useState<UserGrowthReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [markers, setMarkers] = useState<ReportMarker[]>(loadMarkers)
  const [markerName, setMarkerName] = useState('')
  const [markerStartDate, setMarkerStartDate] = useState('')
  const [markerEndDate, setMarkerEndDate] = useState('')
  const [relationshipFilter, setRelationshipFilter] = useState<RelationshipFilter>('Todos')
  const [selectedRelationshipIds, setSelectedRelationshipIds] = useState<Record<string, boolean>>(
    {}
  )
  const [excludedRelationshipIds, setExcludedRelationshipIds] = useState<Record<string, boolean>>(
    {}
  )

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      setReport(
        await getUserGrowthReport(token, {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          excludeUserIds: Object.keys(excludedRelationshipIds).filter(
            (id) => excludedRelationshipIds[id]
          ),
        })
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar relatorio de crescimento')
      setReport(null)
    } finally {
      setIsLoading(false)
    }
  }, [token, startDate, endDate, excludedRelationshipIds])

  useEffect(() => {
    saveMarkers(markers)
  }, [markers])

  function addMarker() {
    if (!markerName.trim() || !markerStartDate) {
      toast.error('Informe nome e data inicial do marcador')
      return
    }
    const nextMarker: ReportMarker = {
      id: `${Date.now()}`,
      name: markerName.trim(),
      startDate: markerStartDate,
      endDate: markerEndDate || markerStartDate,
      visible: true,
    }
    setMarkers((current) => [...current, nextMarker])
    setMarkerName('')
    setMarkerStartDate('')
    setMarkerEndDate('')
  }

  function toggleMarkerVisibility(id: string, visible: boolean) {
    setMarkers((current) =>
      current.map((marker) => (marker.id === id ? { ...marker, visible } : marker))
    )
  }

  function removeMarker(id: string) {
    setMarkers((current) => current.filter((marker) => marker.id !== id))
  }

  function toggleRelationshipUser(id: string, checked: boolean) {
    setSelectedRelationshipIds((current) => {
      const next = { ...current }
      if (checked) next[id] = true
      else delete next[id]
      return next
    })
  }

  function applyRelationshipExclusion() {
    const ids = Object.keys(selectedRelationshipIds).filter((id) => selectedRelationshipIds[id])
    if (ids.length === 0) {
      toast.error('Selecione ao menos uma pessoa')
      return
    }
    setExcludedRelationshipIds((current) => {
      const next = { ...current }
      for (const id of ids) next[id] = true
      return next
    })
    setSelectedRelationshipIds({})
  }

  function clearRelationshipExclusion() {
    setExcludedRelationshipIds({})
    setSelectedRelationshipIds({})
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-5" />
            Crescimento da plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
          <LoadingSkeleton variant="cards" rowCount={6} />
        </CardContent>
      </Card>
    )
  }

  if (!report || (report.daily.length === 0 && report.platforms.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-5" />
            Crescimento da plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
          <EmptyState icon={TrendingUp} message="Sem dados suficientes para montar os graficos." />
        </CardContent>
      </Card>
    )
  }

  const chartData = report.daily
  const recentIndices = latestIndices(chartData)
  const visibleMarkers = markers.filter((marker) => marker.visible)
  const relationshipUsers = report.relationshipUsers.filter(
    (user) => relationshipFilter === 'Todos' || user.relationship === relationshipFilter
  )
  const selectedRelationshipCount = Object.values(selectedRelationshipIds).filter(Boolean).length
  const excludedRelationshipCount = Object.values(excludedRelationshipIds).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Crescimento da plataforma</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Indicadores no modelo da planilha: entradas por dia, acumulado, crescimento, sistema e
              origem.
            </p>
          </div>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de usuarios"
          value={report.totals.total}
          description="Clientes, profissionais e empresas"
        />
        <StatCard
          title="Profissionais"
          value={report.totals.profissionais}
          description={`Media diaria: ${report.averages.profissionais}`}
        />
        <StatCard
          title="Clientes"
          value={report.totals.clientes}
          description={`Media diaria: ${report.averages.clientes}`}
        />
        <StatCard
          title="Media total"
          value={report.averages.total}
          description="Entradas medias por dia"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Marcadores de eventos</CardTitle>
            <CardDescription>
              Cadastre campanhas, propagandas ou eventos para aparecerem nos graficos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome</label>
                <Input
                  value={markerName}
                  onChange={(event) => setMarkerName(event.target.value)}
                  placeholder="Ex.: Propaganda paga"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Inicio</label>
                  <Input
                    type="date"
                    value={markerStartDate}
                    onChange={(event) => setMarkerStartDate(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Fim</label>
                  <Input
                    type="date"
                    value={markerEndDate}
                    onChange={(event) => setMarkerEndDate(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" className="w-full sm:w-auto" onClick={addMarker}>
                  <Plus className="size-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            {markers.length > 0 ? (
              <div className="space-y-2">
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3"
                  >
                    <div>
                      <div className="font-medium">{marker.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {marker.startDate}
                        {marker.endDate && marker.endDate !== marker.startDate
                          ? ` ate ${marker.endDate}`
                          : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={marker.visible}
                          onCheckedChange={(checked) =>
                            toggleMarkerVisibility(marker.id, checked === true)
                          }
                        />
                        Visivel
                      </label>
                      <Button variant="outline" size="sm" onClick={() => removeMarker(marker.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum marcador cadastrado. Os marcadores ficam salvos neste navegador.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parentes, conhecidos e desconhecidos</CardTitle>
            <CardDescription>
              Selecione pessoas para desconsiderar nos graficos de crescimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['Todos', 'Parentes', 'Conhecidos', 'Desconhecido'] as RelationshipFilter[]).map(
                (filter) => (
                  <Button
                    key={filter}
                    type="button"
                    variant={relationshipFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRelationshipFilter(filter)}
                  >
                    {filter}
                  </Button>
                )
              )}
            </div>

            <div className="max-h-[260px] space-y-2 overflow-auto pr-1">
              {relationshipUsers.length > 0 ? (
                relationshipUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.relationship}</span>
                    </span>
                    <Checkbox
                      checked={!!selectedRelationshipIds[user.id]}
                      disabled={!!excludedRelationshipIds[user.id]}
                      onCheckedChange={(checked) =>
                        toggleRelationshipUser(user.id, checked === true)
                      }
                    />
                  </label>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum usuario com relacionamento/origem informado no periodo.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={applyRelationshipExclusion}
                disabled={selectedRelationshipCount === 0}
              >
                Desconsiderar selecionados
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearRelationshipExclusion}
                disabled={excludedRelationshipCount === 0}
              >
                Reconsiderar todos
              </Button>
              <span className="text-xs text-muted-foreground">
                {excludedRelationshipCount} desconsiderado(s)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-5" />
                Evolucao acumulada
              </CardTitle>
              <CardDescription>Profissionais, clientes e total por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[
                  { label: 'Profissionais', color: 'hsl(var(--chart-1))' },
                  { label: 'Clientes', color: 'hsl(var(--chart-2))' },
                  { label: 'Total', color: 'hsl(var(--chart-3))' },
                ]}
              />
              <ChartContainer config={evolutionConfig} className="h-[300px] w-full">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateTick}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <MarkerOverlay markers={visibleMarkers} />
                  <Line
                    type="monotone"
                    dataKey="profissionais"
                    stroke="var(--color-profissionais)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="clientes"
                    stroke="var(--color-clientes)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="size-5" />
                Entradas por dia
              </CardTitle>
              <CardDescription>Novos clientes e profissionais por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[
                  { label: 'Entrada profissionais', color: 'hsl(var(--chart-1))' },
                  { label: 'Entrada clientes', color: 'hsl(var(--chart-2))' },
                ]}
              />
              <ChartContainer config={entriesConfig} className="h-[300px] w-full">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateTick}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <MarkerOverlay markers={visibleMarkers} />
                  <Bar
                    dataKey="entradaProfissionais"
                    fill="var(--color-entradaProfissionais)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="entradaClientes"
                    fill="var(--color-entradaClientes)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="size-5" />
                Taxa de crescimento
              </CardTitle>
              <CardDescription>Variacao percentual sobre o total anterior</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[{ label: 'Taxa de crescimento', color: 'hsl(var(--chart-4))' }]}
              />
              <ChartContainer config={growthConfig} className="h-[260px] w-full">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateTick}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <MarkerOverlay markers={visibleMarkers} />
                  <Line
                    type="monotone"
                    dataKey="taxaCrescimento"
                    stroke="var(--color-taxaCrescimento)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-5" />
                Indices recentes
              </CardTitle>
              <CardDescription>Classificacao diaria de novas entradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentIndices.map((item) => (
                  <div
                    key={item.date}
                    className="grid grid-cols-[64px_1fr_1fr_1fr] items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span>{item.indiceProfissionais}</span>
                    <span>{item.indiceClientes}</span>
                    <span>{item.indiceTotal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <DistributionChart
          title="Sistema operacional"
          description="Distribuicao Android/iOS dos usuarios"
          data={report.platforms}
          icon={Smartphone}
        />
        <DistributionChart
          title="Origem ou relacionamento"
          description="Parentes, conhecidos, desconhecidos ou outro campo equivalente"
          data={report.relationships}
          icon={Users}
        />
      </div>
    </div>
  )
}
