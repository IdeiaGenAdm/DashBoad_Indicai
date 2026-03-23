const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/** Roles com acesso ao dashboard admin (alinhado ao backend). */
export const ADMIN_ROLES = [
  'master',
  'admin',
  'moderator',
  'finance',
  'content',
  'analyst',
] as const

export function isAdminRole(role: string | undefined | null): boolean {
  if (!role || role === 'user') return false
  return (ADMIN_ROLES as readonly string[]).includes(role)
}

export interface LoginResponse {
  user: Record<string, unknown>
  token: string
  message: string
}

export interface UserResponse {
  user: Record<string, unknown>
}

export async function login(cpf: string, senha: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, senha }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Erro ao fazer login')
  }

  return res.json()
}

export async function getMe(token: string): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error('Token inválido ou expirado')
  }

  return res.json()
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Erro ao solicitar recuperação')
  }

  return res.json()
}

export async function resetPassword(
  token: string,
  cpf: string,
  senha: string,
  confirmSenha: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, cpf, senha, confirmSenha }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Erro ao redefinir senha')
  }

  return res.json()
}

// --- API Admin (/api/admin/*) ---

function adminHeaders(authToken: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  }
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AdminApiError'
  }
}

export async function adminFetch<T>(
  path: string,
  authToken: string,
  options?: Omit<RequestInit, 'headers'> & { headers?: HeadersInit }
): Promise<T> {
  const url = `${API_URL}/api/admin${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...options,
    headers: { ...adminHeaders(authToken), ...options?.headers },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message = (data.error || data.message || `Erro: ${res.status}`) as string
    throw new AdminApiError(message, res.status, data as Record<string, unknown>)
  }
  return res.json()
}
