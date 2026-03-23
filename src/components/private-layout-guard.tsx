'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { ThemeToggle } from '@/components/theme-toggle'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DashboardSidebar } from '@/components/layout/sidebar'
import { useAuth } from '@/contexts/auth-context'

export function PrivateLayoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isLoading, logout } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!token) {
      router.replace('/login')
    }
  }, [token, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return (
    <DashboardSidebar onLogout={logout}>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2" />
        <ThemeToggle />
      </header>
      <main className="flex-1 overflow-auto p-4 pb-16 md:pb-4">{children}</main>
      <BottomNav />
    </DashboardSidebar>
  )
}
