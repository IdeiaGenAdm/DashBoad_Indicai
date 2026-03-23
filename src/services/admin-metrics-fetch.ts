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
export async function getTopProfessions(
  authToken: string
): Promise<TopProfessionsResponse> {
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
  return adminFetch<TopRatedProfessionalsResponse>(
    '/stats/top-rated-professionals',
    authToken
  )
}
