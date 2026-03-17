const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
