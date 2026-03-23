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
