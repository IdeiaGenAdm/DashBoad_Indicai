import { adminFetch } from '@/lib/api'

export interface BannerListItem {
  id: string
  titulo?: string
  conteudo?: string
  destinatarios?: string
  vigenciaInicio?: string
  vigenciaFim?: string
  ativo?: boolean
  createdAt?: string
  [key: string]: unknown
}

export interface ListBannersParams {
  page?: number
  limit?: number
}

export interface ListBannersResponse {
  banners?: BannerListItem[]
  data?: BannerListItem[]
  total?: number
  page?: number
  limit?: number
}

/** GET /admin/banners — Listar banners */
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

export interface CreateBannerBody {
  titulo: string
  conteudo: string
  destinatarios?: string
  vigenciaInicio?: string
  vigenciaFim?: string
}

/** POST /admin/banners — Criar banner */
export async function createBanner(
  authToken: string,
  body: CreateBannerBody
): Promise<{ banner: BannerListItem; message?: string }> {
  return adminFetch<{ banner: BannerListItem; message?: string }>('/banners', authToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export interface UpdateBannerBody {
  titulo?: string
  conteudo?: string
  destinatarios?: string
  vigenciaInicio?: string
  vigenciaFim?: string
  ativo?: boolean
}

/** PATCH /admin/banners/:bannerId — Atualizar banner */
export async function updateBanner(
  authToken: string,
  bannerId: string,
  body: UpdateBannerBody
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/banners/${bannerId}`, authToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/** DELETE /admin/banners/:bannerId — Eliminar banner */
export async function deleteBanner(
  authToken: string,
  bannerId: string
): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/banners/${bannerId}`, authToken, {
    method: 'DELETE',
  })
}
