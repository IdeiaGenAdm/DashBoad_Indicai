'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/auth-context'

const TOKEN_KEY = 'indicai_dashboard_token'

export function HomeRedirect() {
  const router = useRouter()
  const { isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (token) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-pulse rounded-xl bg-primary/30" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  )
}
