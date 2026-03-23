'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { QuickActions } from '@/components/features/dashboard/quick-actions'
import { SidebarToggle } from '@/components/layout/aceternity-sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DashboardSidebar } from '@/components/layout/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/auth-context'

export function PrivateLayoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isLoading, logout, user } = useAuth()

  const nome = (user?.nomeCompleto ?? user?.nome ?? '') as string

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
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card/80 px-4 shadow-sm backdrop-blur-sm md:h-16 md:px-6">
        <div className="hidden md:block">
          <SidebarToggle />
        </div>
        <ThemeToggle />
      </header>
      <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6 lg:p-8">{children}</main>
      <QuickActions />
      <BottomNav />
    </DashboardSidebar>
  )
}
