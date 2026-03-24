import { AdminApiError, adminFetch } from '@/lib/api'

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
export async function getTopProfessions(authToken: string): Promise<TopProfessionsResponse> {
  return adminFetch<TopProfessionsResponse>('/stats/top-professions', authToken)
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
  params?: { days?: number; minAvaliacoes?: number; limit?: number }
): Promise<TopRatedProfessionalsResponse> {
  const search = new URLSearchParams()
  if (params?.days != null) search.set('days', String(params.days))
  if (params?.minAvaliacoes != null) search.set('minAvaliacoes', String(params.minAvaliacoes))
  if (params?.limit != null) search.set('limit', String(params.limit))
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
}

/** GET /admin/stats/financial — Relatório financeiro */
export async function getFinancialReport(
  authToken: string,
  params?: FinancialReportParams
): Promise<FinancialReportResponse> {
  const search = new URLSearchParams()
  if (params?.periodo) search.set('periodo', params.periodo)
  if (params?.plano) search.set('plano', params.plano)
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
export async function getPlanStats(authToken: string): Promise<PlanStatsResponse> {
  return adminFetch<PlanStatsResponse>('/stats/plans', authToken)
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
export async function getUsersByCity(authToken: string): Promise<UsersByCityResponse> {
  const res = await adminFetch<Record<string, unknown>>('/stats/users-by-city', authToken)
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
export async function getDemandByRegion(authToken: string): Promise<DemandByRegionResponse> {
  const res = await adminFetch<Record<string, unknown>>('/stats/demand-by-region', authToken)
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
