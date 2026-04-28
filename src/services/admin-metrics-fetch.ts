import { AdminApiError, adminFetch } from '@/lib/api'

export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

function applyDateRange(search: URLSearchParams, params?: DateRangeParams) {
  if (params?.startDate) search.set('startDate', params.startDate)
  if (params?.endDate) search.set('endDate', params.endDate)
}

export interface OverviewMetrics {
  users?: number
  profissionais?: number
  empresas?: number
  clientes?: number
  avaliacoes?: number
  [key: string]: unknown
}

/** GET /admin/metrics/overview — Overview geral */
export async function getOverviewMetrics(authToken: string): Promise<OverviewMetrics> {
  type AvaliacoesCountResponse = { total?: number; avaliacoes?: unknown[]; data?: unknown[] }
  const [res, avaliacoesRes] = await Promise.all([
    adminFetch<Record<string, unknown>>('/metrics/overview', authToken),
    adminFetch<AvaliacoesCountResponse>('/avaliacoes?limit=1&page=1', authToken).catch(
      (): AvaliacoesCountResponse => ({ total: 0, avaliacoes: [], data: [] })
    ),
  ])
  const usersByType = Array.isArray(res.usersByType)
    ? (res.usersByType as Array<Record<string, unknown>>)
    : []
  const countByType = new Map<string, number>()
  for (const row of usersByType) {
    const tipo = typeof row.tipo === 'string' ? row.tipo : ''
    const countRaw = row.count
    const count =
      typeof countRaw === 'number' ? countRaw : typeof countRaw === 'string' ? Number(countRaw) : 0
    if (tipo) countByType.set(tipo, Number.isFinite(count) ? count : 0)
  }

  const totalUsersFromApi =
    typeof res.users === 'number'
      ? res.users
      : typeof res.totalUsers === 'number'
        ? (res.totalUsers as number)
        : 0

  const profissionais =
    typeof res.profissionais === 'number'
      ? res.profissionais
      : typeof res.totalProfessionals === 'number'
        ? (res.totalProfessionals as number)
        : (countByType.get('profissional') ?? 0)

  const empresas =
    typeof res.empresas === 'number'
      ? res.empresas
      : typeof res.totalCompanies === 'number'
        ? (res.totalCompanies as number)
        : (countByType.get('empresa') ?? 0)

  const clientes =
    typeof res.clientes === 'number' ? res.clientes : (countByType.get('cliente') ?? 0)

  const totalUsersComputed = profissionais + clientes + empresas

  const avaliacoesTotal =
    typeof res.avaliacoes === 'number'
      ? res.avaliacoes
      : typeof avaliacoesRes.total === 'number'
        ? avaliacoesRes.total
        : Array.isArray(avaliacoesRes.avaliacoes)
          ? avaliacoesRes.avaliacoes.length
          : Array.isArray(avaliacoesRes.data)
            ? avaliacoesRes.data.length
            : 0

  return {
    ...res,
    users: totalUsersFromApi > 0 ? totalUsersFromApi : totalUsersComputed,
    profissionais,
    empresas,
    clientes,
    avaliacoes: avaliacoesTotal,
    total: totalUsersFromApi > 0 ? totalUsersFromApi : totalUsersComputed,
  }
}

export interface AccountComparisonItem {
  tipo?: string
  total?: number
  ativos?: number
  bloqueados?: number
  [key: string]: unknown
}

export interface AccountsComparisonResponse {
  comparison?: AccountComparisonItem[]
  [key: string]: unknown
}

/** GET /admin/stats/accounts-comparison — Comparativo contas */
export async function getAccountMetricsComparison(
  authToken: string
): Promise<AccountsComparisonResponse> {
  const res = await adminFetch<Record<string, unknown>>('/stats/accounts-comparison', authToken)
  if (Array.isArray(res.comparison)) {
    return res as AccountsComparisonResponse
  }
  const byTipo = Array.isArray((res.users as { byTipo?: unknown })?.byTipo)
    ? ((res.users as { byTipo: Array<Record<string, unknown>> }).byTipo ?? [])
    : []
  return {
    ...res,
    comparison: byTipo.map((item) => ({
      tipo: typeof item.tipo === 'string' ? item.tipo : undefined,
      total:
        typeof item.total === 'number'
          ? item.total
          : typeof item.total === 'string'
            ? Number(item.total)
            : 0,
      ativos:
        typeof item.ativos === 'number'
          ? item.ativos
          : typeof item.ativos === 'string'
            ? Number(item.ativos)
            : 0,
      bloqueados:
        typeof item.inativos === 'number'
          ? item.inativos
          : typeof item.inativos === 'string'
            ? Number(item.inativos)
            : 0,
    })),
  }
}

export interface TopProfessionItem {
  profissao?: string
  nome?: string
  total?: number
  count?: number
  [key: string]: unknown
}

export interface TopProfessionsResponse {
  professions?: TopProfessionItem[]
  data?: TopProfessionItem[]
  [key: string]: unknown
}

/** GET /admin/stats/top-professions — Profissões mais buscadas */
export async function getTopProfessions(
  authToken: string,
  params?: DateRangeParams
): Promise<TopProfessionsResponse> {
  const search = new URLSearchParams()
  applyDateRange(search, params)
  const qs = search.toString()
  return adminFetch<TopProfessionsResponse>(
    `/stats/top-professions${qs ? `?${qs}` : ''}`,
    authToken
  )
}

export interface TopRatedProfessionalItem {
  id?: string
  nome?: string
  nomeCompleto?: string
  profissao?: string
  rating?: number
  avaliacoes?: number
  [key: string]: unknown
}

export interface TopRatedProfessionalsResponse {
  professionals?: TopRatedProfessionalItem[]
  data?: TopRatedProfessionalItem[]
  profissionais?: Array<{
    profissionalId?: string
    nomeCompleto?: string
    mediaNoPeriodo?: string
    avaliacoesNoPeriodo?: number
  }>
  [key: string]: unknown
}

/** GET /admin/stats/top-rated-professionals — Profissionais melhor avaliados */
export async function getTopRatedProfessionals(
  authToken: string,
  params?: { days?: number; minAvaliacoes?: number; limit?: number } & DateRangeParams
): Promise<TopRatedProfessionalsResponse> {
  const search = new URLSearchParams()
  if (params?.days != null) search.set('days', String(params.days))
  if (params?.minAvaliacoes != null) search.set('minAvaliacoes', String(params.minAvaliacoes))
  if (params?.limit != null) search.set('limit', String(params.limit))
  applyDateRange(search, params)
  const qs = search.toString()
  let res: TopRatedProfessionalsResponse
  try {
    res = await adminFetch<TopRatedProfessionalsResponse>(
      `/stats/top-rated-professionals${qs ? `?${qs}` : ''}`,
      authToken
    )
  } catch (error) {
    // Fallback defensivo: monta ranking a partir da listagem de profissionais.
    if (error instanceof AdminApiError && error.status >= 500) {
      const usersRes = await adminFetch<{ users?: Array<Record<string, unknown>> }>(
        '/users?tipoUsuario=profissional&limit=100',
        authToken
      )
      const professionals = (usersRes.users ?? [])
        .map((user) => {
          const ratingRaw =
            typeof user.avaliacaoMedia === 'string'
              ? Number(user.avaliacaoMedia)
              : user.avaliacaoMedia
          const avaliacoesRaw =
            typeof user.totalAvaliacoes === 'string'
              ? Number(user.totalAvaliacoes)
              : user.totalAvaliacoes
          return {
            id: typeof user.id === 'string' ? user.id : undefined,
            nomeCompleto: typeof user.nomeCompleto === 'string' ? user.nomeCompleto : undefined,
            nome: typeof user.nome === 'string' ? user.nome : undefined,
            profissao:
              Array.isArray(user.profissoes) && typeof user.profissoes[0] === 'string'
                ? (user.profissoes[0] as string)
                : undefined,
            rating:
              typeof ratingRaw === 'number' && Number.isFinite(ratingRaw) ? ratingRaw : undefined,
            avaliacoes:
              typeof avaliacoesRaw === 'number' && Number.isFinite(avaliacoesRaw)
                ? avaliacoesRaw
                : undefined,
          } satisfies TopRatedProfessionalItem
        })
        .filter((item) => typeof item.rating === 'number' && (item.avaliacoes ?? 0) > 0)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, params?.limit ?? 10)

      return { professionals }
    }
    throw error
  }
  if (!Array.isArray(res.professionals) && Array.isArray(res.profissionais)) {
    return {
      ...res,
      professionals: res.profissionais.map((item) => ({
        id: item.profissionalId,
        nomeCompleto: item.nomeCompleto,
        rating: typeof item.mediaNoPeriodo === 'string' ? Number(item.mediaNoPeriodo) : undefined,
        avaliacoes:
          typeof item.avaliacoesNoPeriodo === 'number' ? item.avaliacoesNoPeriodo : undefined,
      })),
    }
  }
  if (Array.isArray(res.professionals)) {
    return {
      ...res,
      professionals: res.professionals.map((item) => ({
        ...item,
        rating:
          typeof item.rating === 'number'
            ? item.rating
            : typeof (item as { mediaNoPeriodo?: unknown }).mediaNoPeriodo === 'string'
              ? Number((item as { mediaNoPeriodo?: string }).mediaNoPeriodo)
              : undefined,
      })),
    }
  }
  return res
}

export interface FinancialReportItem {
  periodo?: string
  plano?: string
  total?: number
  receita?: number
  profissionais?: number
  [key: string]: unknown
}

export interface FinancialReportResponse {
  report?: FinancialReportItem[]
  data?: FinancialReportItem[]
  total?: number
  [key: string]: unknown
}

export interface FinancialReportParams {
  periodo?: string
  plano?: string
  startDate?: string
  endDate?: string
}

/** GET /admin/stats/financial — Relatório financeiro */
export async function getFinancialReport(
  authToken: string,
  params?: FinancialReportParams
): Promise<FinancialReportResponse> {
  const search = new URLSearchParams()
  if (params?.periodo) search.set('periodo', params.periodo)
  if (params?.plano) search.set('plano', params.plano)
  applyDateRange(search, params)
  const qs = search.toString()
  return adminFetch<FinancialReportResponse>(`/stats/financial${qs ? `?${qs}` : ''}`, authToken)
}

export interface PlanStatsItem {
  plano?: string
  total?: number
  ativos?: number
  [key: string]: unknown
}

export interface PlanStatsResponse {
  plans?: PlanStatsItem[]
  stats?: PlanStatsItem[]
  data?: PlanStatsItem[]
  [key: string]: unknown
}

/** GET /admin/stats/plans — Stats planos */
export async function getPlanStats(
  authToken: string,
  params?: DateRangeParams
): Promise<PlanStatsResponse> {
  const search = new URLSearchParams()
  applyDateRange(search, params)
  const qs = search.toString()
  return adminFetch<PlanStatsResponse>(`/stats/plans${qs ? `?${qs}` : ''}`, authToken)
}

export interface UsersByCityItem {
  cidade?: string
  regiao?: string
  total?: number
  [key: string]: unknown
}

export interface UsersByCityResponse {
  cities?: UsersByCityItem[]
  data?: UsersByCityItem[]
  [key: string]: unknown
}

/** GET /admin/stats/users-by-city — Utilizadores por cidade */
export async function getUsersByCity(
  authToken: string,
  params?: DateRangeParams
): Promise<UsersByCityResponse> {
  const search = new URLSearchParams()
  applyDateRange(search, params)
  const qs = search.toString()
  const res = await adminFetch<Record<string, unknown>>(
    `/stats/users-by-city${qs ? `?${qs}` : ''}`,
    authToken
  )
  const cities = Array.isArray(res.cities) ? (res.cities as Array<Record<string, unknown>>) : []
  return {
    ...res,
    cities: cities.map((item) => ({
      cidade: typeof item.cidade === 'string' ? item.cidade : undefined,
      regiao: typeof item.regiao === 'string' ? item.regiao : undefined,
      total:
        typeof item.total === 'number'
          ? item.total
          : typeof item.count === 'number'
            ? (item.count as number)
            : 0,
    })),
  }
}

export interface DemandByRegionItem {
  regiao?: string
  total?: number
  [key: string]: unknown
}

export interface DemandByRegionResponse {
  regions?: DemandByRegionItem[]
  data?: DemandByRegionItem[]
  [key: string]: unknown
}

/** GET /admin/stats/demand-by-region — Demanda por região */
export async function getDemandByRegion(
  authToken: string,
  params?: DateRangeParams
): Promise<DemandByRegionResponse> {
  const search = new URLSearchParams()
  applyDateRange(search, params)
  const qs = search.toString()
  const res = await adminFetch<Record<string, unknown>>(
    `/stats/demand-by-region${qs ? `?${qs}` : ''}`,
    authToken
  )
  if (Array.isArray(res.regions)) {
    return res as DemandByRegionResponse
  }
  const regioes = Array.isArray(res.regioes) ? (res.regioes as Array<Record<string, unknown>>) : []
  return {
    ...res,
    regions: regioes.map((item) => ({
      regiao:
        typeof item.regiao === 'string'
          ? item.regiao
          : typeof item.cidade === 'string'
            ? item.cidade
            : undefined,
      total:
        typeof item.total === 'number'
          ? item.total
          : typeof item.count === 'number'
            ? (item.count as number)
            : 0,
    })),
  }
}

export interface GrowthReportPoint {
  date: string
  label: string
  profissionais: number
  clientes: number
  empresas: number
  total: number
  entradaProfissionais: number
  entradaClientes: number
  entradaEmpresas: number
  entradaTotal: number
  taxaCrescimento: number
  indiceProfissionais: 'Positivo' | 'Neutro' | 'Negativo'
  indiceClientes: 'Positivo' | 'Neutro' | 'Negativo'
  indiceTotal: 'Positivo' | 'Neutro' | 'Negativo'
}

export interface ReportDistributionItem {
  name: string
  value: number
}

export interface RelationshipUserItem {
  id: string
  name: string
  relationship: string
}

export interface UserGrowthReport {
  daily: GrowthReportPoint[]
  platforms: ReportDistributionItem[]
  relationships: ReportDistributionItem[]
  relationshipUsers: RelationshipUserItem[]
  averages: {
    profissionais: number
    clientes: number
    total: number
  }
  totals: {
    profissionais: number
    clientes: number
    empresas: number
    total: number
    android: number
    ios: number
    unknownPlatform: number
  }
}

export interface UserGrowthReportParams extends DateRangeParams {
  excludeUserIds?: string[]
}

type RawUser = Record<string, unknown>

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function readString(record: RawUser, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return null
}

function normalizeUserType(record: RawUser): 'profissional' | 'cliente' | 'empresa' | 'outro' {
  const raw = readString(record, ['tipoUsuario', 'tipo', 'type', 'role', 'perfil'])?.toLowerCase()
  if (!raw) return 'outro'
  if (raw.includes('prof')) return 'profissional'
  if (raw.includes('emp')) return 'empresa'
  if (raw.includes('client') || raw.includes('cliente') || raw.includes('user')) return 'cliente'
  return 'outro'
}

function normalizePlatform(record: RawUser): string | null {
  const raw = readString(record, [
    'sistema',
    'sistemaOperacional',
    'operatingSystem',
    'os',
    'platform',
    'plataforma',
    'device',
    'deviceType',
    'dispositivo',
    'appPlatform',
  ])
  if (!raw) return null
  const lower = raw.toLowerCase()
  if (lower.includes('android')) return 'Android'
  if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) return 'iOS'
  return raw
}

function normalizeRelationship(record: RawUser): string | null {
  const raw = readString(record, [
    'relacionamento',
    'relacao',
    'relationship',
    'origem',
    'source',
    'comoConheceu',
    'indicacao',
    'tipoIndicacao',
    'parentesco',
    'grauParentesco',
  ])
  if (!raw) return null
  const lower = raw.toLowerCase()
  if (lower.includes('parent') || lower.includes('famil')) return 'Parentes'
  if (lower.includes('conhecid') || lower.includes('amig') || lower.includes('indic')) {
    return 'Conhecidos'
  }
  if (lower.includes('desconhecid') || lower.includes('outro') || lower.includes('nenhum')) {
    return 'Desconhecido'
  }
  return raw
}

function userId(record: RawUser): string | null {
  return readString(record, ['id', '_id', 'userId'])
}

function userDisplayName(record: RawUser): string {
  return (
    readString(record, ['nomeCompleto', 'nome', 'name', 'displayName', 'email', 'cpf']) ??
    'Sem nome'
  )
}

function readDateFromUser(record: RawUser): Date | null {
  const raw = readString(record, [
    'createdAt',
    'created_at',
    'created',
    'dataCriacao',
    'dataCadastro',
    'registeredAt',
  ])
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function dateKeyFromUser(record: RawUser): string | null {
  const date = readDateFromUser(record)
  if (!date) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

function dateLabel(key: string): string {
  const date = dateFromKey(key)
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
}

function growthIndex(value: number): 'Positivo' | 'Neutro' | 'Negativo' {
  if (value > 0) return 'Positivo'
  if (value < 0) return 'Negativo'
  return 'Neutro'
}

function distributionFromMap(map: Map<string, number>): ReportDistributionItem[] {
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
}

function isWithinRange(record: RawUser, params?: DateRangeParams): boolean {
  if (!params?.startDate && !params?.endDate) return true
  const date = readDateFromUser(record)
  if (!date) return false
  if (params.startDate) {
    const start = new Date(`${params.startDate}T00:00:00`)
    if (date < start) return false
  }
  if (params.endDate) {
    const end = new Date(`${params.endDate}T23:59:59.999`)
    if (date > end) return false
  }
  return true
}

async function fetchAllUsersForReport(
  authToken: string,
  params?: UserGrowthReportParams
): Promise<RawUser[]> {
  const pageSize = 500
  const all: RawUser[] = []
  const seen = new Set<string>()

  for (let page = 1; page <= 100; page++) {
    const search = new URLSearchParams()
    search.set('page', String(page))
    search.set('limit', String(pageSize))
    search.set('sortBy', 'createdAt')
    search.set('sortOrder', 'asc')
    applyDateRange(search, params)

    const res = await adminFetch<{
      users?: RawUser[]
      data?: RawUser[]
      total?: number | string
      pagination?: { total?: number | string }
    }>(`/users?${search.toString()}`, authToken)

    const users = Array.isArray(res.users) ? res.users : Array.isArray(res.data) ? res.data : []
    for (const user of users) {
      if (!isWithinRange(user, params)) continue
      const id = userId(user) ?? `${page}-${all.length}`
      if (!seen.has(id)) {
        seen.add(id)
        all.push(user)
      }
    }

    const total = asNumber(res.total ?? res.pagination?.total)
    if ((total != null && all.length >= total) || users.length < pageSize) break
  }

  return all
}

/** Relatorio no modelo da planilha graficos.xlsx. */
export async function getUserGrowthReport(
  authToken: string,
  params?: UserGrowthReportParams
): Promise<UserGrowthReport> {
  const users = await fetchAllUsersForReport(authToken, params)
  const excludedIds = new Set(params?.excludeUserIds ?? [])
  const byDay = new Map<
    string,
    { profissionais: number; clientes: number; empresas: number; total: number }
  >()
  const platforms = new Map<string, number>()
  const relationships = new Map<string, number>()
  const relationshipUsersMap = new Map<string, RelationshipUserItem>()
  const totals = {
    profissionais: 0,
    clientes: 0,
    empresas: 0,
    total: 0,
    android: 0,
    ios: 0,
    unknownPlatform: 0,
  }

  for (const user of users) {
    const id = userId(user)
    const relationship = normalizeRelationship(user)
    if (id && relationship) {
      relationshipUsersMap.set(id, {
        id,
        name: userDisplayName(user),
        relationship,
      })
    }
    if (id && excludedIds.has(id)) continue

    const type = normalizeUserType(user)
    if (type === 'profissional') totals.profissionais += 1
    else if (type === 'empresa') totals.empresas += 1
    else if (type === 'cliente') totals.clientes += 1
    totals.total += 1

    const platform = normalizePlatform(user)
    if (platform) {
      platforms.set(platform, (platforms.get(platform) ?? 0) + 1)
      if (platform === 'Android') totals.android += 1
      else if (platform === 'iOS') totals.ios += 1
    } else {
      totals.unknownPlatform += 1
    }

    if (relationship) {
      relationships.set(relationship, (relationships.get(relationship) ?? 0) + 1)
    }

    const key = dateKeyFromUser(user)
    if (!key) continue
    const entry = byDay.get(key) ?? { profissionais: 0, clientes: 0, empresas: 0, total: 0 }
    if (type === 'profissional') entry.profissionais += 1
    else if (type === 'empresa') entry.empresas += 1
    else if (type === 'cliente') entry.clientes += 1
    entry.total += 1
    byDay.set(key, entry)
  }

  const keys = Array.from(byDay.keys()).sort()
  const daily: GrowthReportPoint[] = []
  let cumulative = { profissionais: 0, clientes: 0, empresas: 0, total: 0 }

  if (keys.length > 0) {
    let cursor = dateFromKey(keys[0]!)
    const last = dateFromKey(keys[keys.length - 1]!)
    while (cursor <= last) {
      const key = dateKey(cursor)
      const entry = byDay.get(key) ?? { profissionais: 0, clientes: 0, empresas: 0, total: 0 }
      const previousTotal = cumulative.total
      cumulative = {
        profissionais: cumulative.profissionais + entry.profissionais,
        clientes: cumulative.clientes + entry.clientes,
        empresas: cumulative.empresas + entry.empresas,
        total: cumulative.total + entry.total,
      }
      daily.push({
        date: key,
        label: dateLabel(key),
        profissionais: cumulative.profissionais,
        clientes: cumulative.clientes,
        empresas: cumulative.empresas,
        total: cumulative.total,
        entradaProfissionais: entry.profissionais,
        entradaClientes: entry.clientes,
        entradaEmpresas: entry.empresas,
        entradaTotal: entry.total,
        taxaCrescimento:
          previousTotal > 0 ? Number(((entry.total / previousTotal) * 100).toFixed(2)) : 0,
        indiceProfissionais: growthIndex(entry.profissionais),
        indiceClientes: growthIndex(entry.clientes),
        indiceTotal: growthIndex(entry.total),
      })
      cursor = addDays(cursor, 1)
    }
  }

  const days = Math.max(daily.length, 1)
  const totalEntries = daily.reduce((acc, item) => acc + item.entradaTotal, 0)
  const professionalEntries = daily.reduce((acc, item) => acc + item.entradaProfissionais, 0)
  const clientEntries = daily.reduce((acc, item) => acc + item.entradaClientes, 0)

  return {
    daily,
    platforms: distributionFromMap(platforms),
    relationships: distributionFromMap(relationships),
    relationshipUsers: Array.from(relationshipUsersMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    averages: {
      profissionais: Number((professionalEntries / days).toFixed(2)),
      clientes: Number((clientEntries / days).toFixed(2)),
      total: Number((totalEntries / days).toFixed(2)),
    },
    totals,
  }
}
