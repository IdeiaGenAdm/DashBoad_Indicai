import { Suspense } from 'react'

import { RecuperarSenhaContent } from '@/components/auth/recuperar-senha/recuperar-senha-content'

export default function RecuperarSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col items-center gap-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      }
    >
      <RecuperarSenhaContent />
    </Suspense>
  )
}
