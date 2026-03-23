import { adminFetch } from '@/lib/api'

export interface EmpresaCreateBody {
  nomeCompleto: string
  cnpj: string
  email: string
  senha?: string
  [key: string]: unknown
}

export interface Empresa {
  id: string
  nomeCompleto?: string
  cnpj?: string
  email?: string
  status?: string
  createdAt?: string
  [key: string]: unknown
}

/** POST /admin/empresas — Criar conta empresa */
export async function createEmpresaAccount(
  authToken: string,
  body: EmpresaCreateBody
): Promise<{ empresa?: Empresa; user?: Empresa; message?: string }> {
  return adminFetch<{ empresa?: Empresa; user?: Empresa; message?: string }>(
    '/empresas',
    authToken,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  )
}
