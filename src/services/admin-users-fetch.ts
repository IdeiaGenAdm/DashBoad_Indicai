import { adminFetch } from '@/lib/api'

export interface UserListItem {
  id: string
  tipoUsuario?: string
  nomeCompleto?: string
  nome?: string
  cpf?: string
  email?: string
  status?: string
  createdAt?: string
  [key: string]: unknown
}

export interface ListUsersParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
}

export interface ListUsersResponse {
  users?: UserListItem[]
  total?: number
  page?: number
  limit?: number
}

/** GET /admin/users — Listar utilizadores */
export async function listUsers(
  authToken: string,
  params?: ListUsersParams
): Promise<ListUsersResponse> {
  const search = new URLSearchParams()
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.search) search.set('search', params.search)
  if (params?.sortBy) search.set('sortBy', params.sortBy)
  if (params?.sortOrder) search.set('sortOrder', params.sortOrder)
  if (params?.status) search.set('status', params.status)
  const qs = search.toString()
  return adminFetch<ListUsersResponse>(`/users${qs ? `?${qs}` : ''}`, authToken)
}

/** GET /admin/users/:userId — Detalhe utilizador */
export async function getUserById(
  authToken: string,
  userId: string
): Promise<{ user: UserListItem }> {
  return adminFetch<{ user: UserListItem }>(`/users/${userId}`, authToken)
}

export interface CreateUserBody {
  tipoUsuario: 'profissional' | 'empresa' | 'cliente'
  nomeCompleto: string
  cpf: string
  email: string
  senha?: string
  [key: string]: unknown
}

/** POST /admin/users — Criar conta (profissional ou cliente) */
export async function createUserAccount(
  authToken: string,
  body: CreateUserBody
): Promise<{ user: UserListItem; message?: string }> {
  return adminFetch<{ user: UserListItem; message?: string }>('/users', authToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** POST /admin/users/:userId/ban — Bloquear utilizador */
export async function banUser(authToken: string, userId: string): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/users/${userId}/ban`, authToken, {
    method: 'POST',
  })
}

/** POST /admin/users/:userId/unban — Desbloquear utilizador */
export async function unbanUser(authToken: string, userId: string): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/users/${userId}/unban`, authToken, {
    method: 'POST',
  })
}

/** DELETE /admin/users/:userId — Eliminar conta (requireMaster) */
export async function deleteUser(authToken: string, userId: string): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>(`/users/${userId}`, authToken, {
    method: 'DELETE',
  })
}
