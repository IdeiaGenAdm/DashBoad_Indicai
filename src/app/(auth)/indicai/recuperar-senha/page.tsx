import { Suspense } from 'react'

import { RecuperarSenhaContent } from './recuperar-senha-content'

export default function RecuperarSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col items-center gap-8">
          <h1 className="text-2xl font-bold">Dashboard IndicAI</h1>
          <p>Carregando...</p>
        </div>
      }
    >
      <RecuperarSenhaContent />
    </Suspense>
  )
}
