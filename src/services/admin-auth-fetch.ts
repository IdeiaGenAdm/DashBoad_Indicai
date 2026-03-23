import { adminFetch } from '@/lib/api'

/** POST /admin/auth/change-password - Alterar senha do admin autenticado */
export async function changeAdminPassword(
  authToken: string,
  body: { senhaAtual: string; senhaNova: string }
): Promise<{ message: string }> {
  return adminFetch<{ message: string }>('/auth/change-password', authToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
