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
  count?: number
  total?: number
  page?: number
  limit?: number
}

interface AdminUsersResponse {
  users?: Array<Record<string, unknown>>
  count?: number
}

interface AdminAssinaturasResponse {
  assinaturas?: Array<{
    profissionalId?: string
    nivelPatrocinio?: string
    tipoPlano?: string
    nextChargeAt?: string
    createdAt?: string
  }>
}

/** GET /admin/users?tipoUsuario=profissional — Lista de profissionais */
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
  search.set('tipoUsuario', 'profissional')
  const qs = search.toString()
  const [usersRes, assinaturasRes] = await Promise.all([
    adminFetch<AdminUsersResponse>(`/users${qs ? `?${qs}` : ''}`, authToken),
    adminFetch<AdminAssinaturasResponse>('/assinaturas?limit=500', authToken).catch(
      () => ({ assinaturas: [] }) as AdminAssinaturasResponse
    ),
  ])

  const latestPlanByProfessional = new Map<string, { plano?: string; expiresAt?: string }>()
  for (const assinatura of assinaturasRes.assinaturas ?? []) {
    if (!assinatura?.profissionalId) continue
    if (!latestPlanByProfessional.has(assinatura.profissionalId)) {
      latestPlanByProfessional.set(assinatura.profissionalId, {
        plano: assinatura.nivelPatrocinio ?? assinatura.tipoPlano,
        expiresAt: assinatura.nextChargeAt,
      })
    }
  }

  const professionals = (usersRes.users ?? [])
    .filter((u): u is Record<string, unknown> => !!u && typeof u === 'object')
    .map((u) => {
      const id = typeof u.id === 'string' ? u.id : ''
      const profissoes = Array.isArray(u.profissoes) ? u.profissoes : []
      const planoData = latestPlanByProfessional.get(id)
      const ratingRaw =
        typeof u.avaliacaoMedia === 'string' ? Number(u.avaliacaoMedia) : u.avaliacaoMedia
      return {
        id,
        userId: id,
        nomeCompleto: typeof u.nomeCompleto === 'string' ? u.nomeCompleto : undefined,
        nome: typeof u.nome === 'string' ? u.nome : undefined,
        profissao:
          typeof u.profissao === 'string'
            ? u.profissao
            : typeof profissoes[0] === 'string'
              ? (profissoes[0] as string)
              : undefined,
        plano:
          typeof planoData?.plano === 'string'
            ? planoData.plano
            : typeof u.nivelPatrocinio === 'string'
              ? u.nivelPatrocinio
              : undefined,
        rating: typeof ratingRaw === 'number' && Number.isFinite(ratingRaw) ? ratingRaw : undefined,
        expiresAt:
          typeof planoData?.expiresAt === 'string'
            ? planoData.expiresAt
            : typeof u.nextChargeAt === 'string'
              ? u.nextChargeAt
              : undefined,
      } satisfies ProfessionalListItem
    })
    .filter((p) => p.id)

  return {
    professionals,
    total: usersRes.count ?? professionals.length,
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  }
}

export interface UpdateSubscriptionBody {
  plano?: string
  expiresAt?: string
  nuncaExpirar?: boolean
}

export interface ActiveSubscriptionItem {
  id: string
  profissionalId?: string
  nomeCompleto?: string | null
  nivelPatrocinio?: string | null
  status?: string | null
  valor?: string | number | null
  nextChargeAt?: string | null
  createdAt?: string | null
}

export interface ListActiveSubscriptionsResponse {
  assinaturas: ActiveSubscriptionItem[]
  count: number
}

/** GET /admin/assinaturas?status=ativo — Assinaturas ativas */
export async function listActiveSubscriptions(
  authToken: string,
  params?: { limit?: number; offset?: number }
): Promise<ListActiveSubscriptionsResponse> {
  const search = new URLSearchParams()
  search.set('status', 'ativo')
  search.set('limit', String(params?.limit ?? 20))
  search.set('offset', String(params?.offset ?? 0))

  const res = await adminFetch<{ assinaturas?: ActiveSubscriptionItem[]; count?: number }>(
    `/assinaturas?${search.toString()}`,
    authToken
  )

  return {
    assinaturas: Array.isArray(res.assinaturas) ? res.assinaturas : [],
    count: typeof res.count === 'number' ? res.count : 0,
  }
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
