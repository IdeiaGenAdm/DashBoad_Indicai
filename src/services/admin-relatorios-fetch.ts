import { adminFetch } from '@/lib/api'

export interface RelatorioListItem {
  id: string
  tipo?: string
  estado?: string
  status?: string
  autorEmail?: string
  autorNome?: string
  mensagem?: string
  createdAt?: string
  [key: string]: unknown
}

export interface ListRelatoriosParams {
  page?: number
  limit?: number
  tipo?: string
  estado?: string
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListRelatoriosResponse {
  relatorios?: RelatorioListItem[]
  data?: RelatorioListItem[]
  total?: number
  page?: number
  limit?: number
}

/** GET /admin/relatorios — Listar denúncias/sugestões/reclamações */
export async function listRelatorios(
  authToken: string,
  params?: ListRelatoriosParams
): Promise<ListRelatoriosResponse> {
  const search = new URLSearchParams()
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.tipo) search.set('tipo', params.tipo)
  if (params?.estado) search.set('estado', params.estado)
  if (params?.status) search.set('status', params.status)
  if (params?.search) search.set('search', params.search)
  if (params?.sortBy) search.set('sortBy', params.sortBy)
  if (params?.sortOrder) search.set('sortOrder', params.sortOrder)
  const qs = search.toString()
  return adminFetch<ListRelatoriosResponse>(`/relatorios${qs ? `?${qs}` : ''}`, authToken)
}

export interface FeedbackSummaryItem {
  tipo?: string
  total?: number
  [key: string]: unknown
}

export interface ListFeedbackSummaryResponse {
  summary?: FeedbackSummaryItem[]
  data?: FeedbackSummaryItem[]
}

/** GET /admin/feedback/summary — Resumo feedback */
export async function listFeedbackSummary(authToken: string): Promise<ListFeedbackSummaryResponse> {
  return adminFetch<ListFeedbackSummaryResponse>('/feedback/summary', authToken)
}

/** POST /admin/relatorios/:tipo/:id/respond — Responder ao autor (email) */
export async function respondReportFeedback(
  authToken: string,
  tipo: string,
  id: string,
  body: { resposta: string }
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/relatorios/${tipo}/${id}/respond`, authToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** DELETE /admin/relatorios/:tipo/:id — Eliminar */
export async function deleteRelatorio(
  authToken: string,
  tipo: string,
  id: string
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/relatorios/${tipo}/${id}`, authToken, {
    method: 'DELETE',
  })
}

/** PATCH /admin/relatorios/:tipo/:id/status — Atualizar estado */
export async function updateReportStatus(
  authToken: string,
  tipo: string,
  id: string,
  body: { status: string }
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/relatorios/${tipo}/${id}/status`, authToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
