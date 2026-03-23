import { FinancialReport } from '@/components/features/relatorios/financial-report'
import { TopProfessionsCard } from '@/components/features/relatorios/top-professions-card'
import { TopRatedProfessionalsCard } from '@/components/features/relatorios/top-rated-professionals-card'

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Métricas e analytics.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TopProfessionsCard />
        <TopRatedProfessionalsCard />
      </div>
      <FinancialReport />
    </div>
  )
}
