'use client'

import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { login as apiLogin, getMe, isAdminRole } from '@/lib/api'

const TOKEN_KEY = 'indicai_dashboard_token'

interface User {
  id: string
  role?: string
  nomeCompleto?: string
  email?: string
  [key: string]: unknown
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (cpf: string, senha: string) => Promise<void>
  logout: (options?: { message?: string }) => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setToken = useCallback((newToken: string | null) => {
    if (typeof window === 'undefined') return
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setTokenState(newToken)
  }, [])

  const login = useCallback(
    async (cpf: string, senha: string) => {
      const res = await apiLogin(cpf, senha)
      const role = (res.user?.role as string) ?? 'user'
      if (!isAdminRole(role)) {
        throw new Error('Acesso restrito a administradores')
      }
      setToken(res.token)
      setUser(res.user as User)
      router.push('/dashboard')
    },
    [router, setToken]
  )

  const logout = useCallback(
    (options?: { message?: string }) => {
      setToken(null)
      setUser(null)
      const search = options?.message ? `?message=${encodeURIComponent(options.message)}` : ''
      router.push(`/login${search}`)
    },
    [router, setToken]
  )

  useEffect(() => {
    const storedToken = getStoredToken()
    setTokenState(storedToken)

    if (storedToken) {
      getMe(storedToken)
        .then(({ user }) => {
          const role = (user?.role as string) ?? 'user'
          if (!isAdminRole(role)) {
            setToken(null)
            setUser(null)
            return
          }
          setUser(user as User)
        })
        .catch(() => setToken(null))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [setToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
