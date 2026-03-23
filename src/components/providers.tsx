'use client'

import { type ReactNode } from 'react'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster richColors position="top-right" />
      </NextThemesProvider>
    </NuqsAdapter>
  )
}
