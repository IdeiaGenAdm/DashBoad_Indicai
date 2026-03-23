import { AvaliacoesList } from '@/components/features/avaliacoes/avaliacoes-list'

export default function AvaliacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground">Moderação de avaliações.</p>
      </div>
      <AvaliacoesList />
    </div>
  )
}
