import { adminFetch } from '@/lib/api'

/** Formato devolvido pelo backend (Drizzle camelCase). */
export interface BannerApi {
  id: string
  title: string
  body: string
  imageUrl?: string | null
  startsAt?: string | Date | null
  endsAt?: string | Date | null
  audienceType: 'all' | 'users' | 'segment'
  audienceUserIds?: string[] | null
  createdByAdminId: string
  active: boolean
  createdAt?: string | Date | null
}

export interface ListBannersParams {
  page?: number
  limit?: number
}

export interface ListBannersResponse {
  banners?: BannerApi[]
  total?: number
}

/** Resposta real do POST /api/admin/banners */
export interface CreateBannerResponse {
  message: string
  bannerId: string
}

export interface UpdateBannerResponse {
  message: string
  bannerId: string
}

/** GET /api/admin/banners */
export async function listBanners(
  authToken: string,
  params?: ListBannersParams
): Promise<ListBannersResponse> {
  const search = new URLSearchParams()
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.limit != null) search.set('limit', String(params.limit))
  const qs = search.toString()
  return adminFetch<ListBannersResponse>(`/banners${qs ? `?${qs}` : ''}`, authToken)
}

/** Corpo aceite pelo backend (createAdminBannerSchema). */
export interface CreateBannerBody {
  title: string
  body: string
  imageUrl?: string | null
  startsAt?: string | null
  endsAt?: string | null
  audienceType?: 'all' | 'users' | 'segment'
  audienceUserIds?: string[] | null
  active?: boolean
}

/** POST /api/admin/banners */
export async function createBanner(
  authToken: string,
  body: CreateBannerBody
): Promise<CreateBannerResponse> {
  return adminFetch<CreateBannerResponse>('/banners', authToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export type UpdateBannerBody = Partial<CreateBannerBody>

/** PATCH /api/admin/banners/:bannerId */
export async function updateBanner(
  authToken: string,
  bannerId: string,
  body: UpdateBannerBody
): Promise<UpdateBannerResponse> {
  return adminFetch<UpdateBannerResponse>(`/banners/${bannerId}`, authToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/** DELETE /api/admin/banners/:bannerId */
export async function deleteBanner(
  authToken: string,
  bannerId: string
): Promise<{ message: string; bannerId: string }> {
  return adminFetch<{ message: string; bannerId: string }>(`/banners/${bannerId}`, authToken, {
    method: 'DELETE',
  })
}

/** Etiqueta PT para a tabela (o backend só tem all | users | segment). */
export function labelAudienceType(t: BannerApi['audienceType']): string {
  switch (t) {
    case 'all':
      return 'Todos'
    case 'users':
      return 'Utilizadores autenticados'
    case 'segment':
      return 'Segmento (IDs)'
    default:
      return String(t)
  }
}

export function formatBannerDate(v: string | Date | null | undefined): string {
  if (v == null) return ''
  const d = typeof v === 'string' ? new Date(v) : v
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
