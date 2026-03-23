import { adminFetch } from '@/lib/api'

export interface ProfessionalListItem {
  id: string
  userId?: string
  nomeCompleto?: string
  nome?: string
  profissao?: string
  plano?: string
  rating?: number
  expiresAt?: string
  [key: string]: unknown
}

export interface ListProfessionalsParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListProfessionalsResponse {
  professionals?: ProfessionalListItem[]
  data?: ProfessionalListItem[]
  total?: number
  page?: number
  limit?: number
}

/** GET /admin/professionals — Listar profissionais (assumido; contrato não documenta) */
export async function listProfessionals(
  authToken: string,
  params?: ListProfessionalsParams
): Promise<ListProfessionalsResponse> {
  const search = new URLSearchParams()
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.search) search.set('search', params.search)
  if (params?.sortBy) search.set('sortBy', params.sortBy)
  if (params?.sortOrder) search.set('sortOrder', params.sortOrder)
  const qs = search.toString()
  return adminFetch<ListProfessionalsResponse>(`/professionals${qs ? `?${qs}` : ''}`, authToken)
}

export interface UpdateSubscriptionBody {
  plano?: string
  expiresAt?: string
  nuncaExpirar?: boolean
}

/** PATCH /admin/professionals/:professionalId/subscription — Alterar plano/expiração */
export async function updateProfessionalSubscription(
  authToken: string,
  professionalId: string,
  body: UpdateSubscriptionBody
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(
    `/professionals/${professionalId}/subscription`,
    authToken,
    { method: 'PATCH', body: JSON.stringify(body) }
  )
}

/** PATCH /admin/profissionais/:profissionalId/estrelas — Alterar classificação */
export async function updateRating(
  authToken: string,
  profissionalId: string,
  body: { estrelas: number }
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/profissionais/${profissionalId}/estrelas`, authToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
