import { Star } from 'lucide-react'

import { AvaliacoesList } from '@/components/features/avaliacoes/avaliacoes-list'
import { PageHeader } from '@/components/ui/page-header'

export default function AvaliacoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Avaliações"
        description="Moderação e gestão de avaliações da plataforma"
        icon={Star}
      />
      <AvaliacoesList />
    </div>
  )
}
