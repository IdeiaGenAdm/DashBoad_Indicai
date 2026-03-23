import { adminFetch } from '@/lib/api'

export interface AvaliacaoListItem {
  id: string
  profissionalId?: string
  profissionalNome?: string
  autorNome?: string
  autorEmail?: string
  rating?: number
  comentario?: string
  status?: string
  createdAt?: string
  [key: string]: unknown
}

export interface ListAvaliacoesParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
}

export interface ListAvaliacoesResponse {
  avaliacoes?: AvaliacaoListItem[]
  data?: AvaliacaoListItem[]
  total?: number
  page?: number
  limit?: number
}

/** GET /admin/avaliacoes — Listar avaliações */
export async function listAvaliacoes(
  authToken: string,
  params?: ListAvaliacoesParams
): Promise<ListAvaliacoesResponse> {
  const search = new URLSearchParams()
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.search) search.set('search', params.search)
  if (params?.sortBy) search.set('sortBy', params.sortBy)
  if (params?.sortOrder) search.set('sortOrder', params.sortOrder)
  if (params?.status) search.set('status', params.status)
  const qs = search.toString()
  return adminFetch<ListAvaliacoesResponse>(`/avaliacoes${qs ? `?${qs}` : ''}`, authToken)
}

/** PATCH /admin/avaliacoes/:avaliacaoId/suspend — Suspender avaliação */
export async function suspendAvaliacao(
  authToken: string,
  avaliacaoId: string
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/avaliacoes/${avaliacaoId}/suspend`, authToken, {
    method: 'PATCH',
  })
}

/** PATCH /admin/avaliacoes/:avaliacaoId/restore — Restaurar avaliação */
export async function restoreAvaliacao(
  authToken: string,
  avaliacaoId: string
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/avaliacoes/${avaliacaoId}/restore`, authToken, {
    method: 'PATCH',
  })
}

/** DELETE /admin/avaliacoes/:avaliacaoId — Eliminar avaliação */
export async function deleteAvaliacao(
  authToken: string,
  avaliacaoId: string
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/avaliacoes/${avaliacaoId}`, authToken, {
    method: 'DELETE',
  })
}
