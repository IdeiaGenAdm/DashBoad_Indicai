import { adminFetch } from '@/lib/api'

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
  return adminFetch<OverviewMetrics>('/metrics/overview', authToken)
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
  return adminFetch<AccountsComparisonResponse>('/stats/accounts-comparison', authToken)
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
  [key: string]: unknown
}

/** GET /admin/stats/top-rated-professionals — Profissionais melhor avaliados */
export async function getTopRatedProfessionals(
  authToken: string
): Promise<TopRatedProfessionalsResponse> {
  return adminFetch<TopRatedProfessionalsResponse>('/stats/top-rated-professionals', authToken)
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
  return adminFetch<UsersByCityResponse>('/stats/users-by-city', authToken)
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
  return adminFetch<DemandByRegionResponse>('/stats/demand-by-region', authToken)
}
