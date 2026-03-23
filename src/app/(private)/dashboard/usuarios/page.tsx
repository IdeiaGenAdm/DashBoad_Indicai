import { Suspense } from 'react'

import { UsuariosContent } from '@/components/features/usuarios/usuarios-content'

export default function UsuariosPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
      <UsuariosContent />
    </Suspense>
  )
}
