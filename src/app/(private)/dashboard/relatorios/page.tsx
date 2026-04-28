import { BarChart3 } from 'lucide-react'

import { FinancialReport } from '@/components/features/relatorios/financial-report'
import { GrowthReport } from '@/components/features/relatorios/growth-report'
import { LocationStats } from '@/components/features/relatorios/location-stats'
import { TopProfessionsCard } from '@/components/features/relatorios/top-professions-card'
import { TopRatedProfessionalsCard } from '@/components/features/relatorios/top-rated-professionals-card'
import { PageHeader } from '@/components/ui/page-header'

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Métricas, analytics e desempenho da plataforma"
        icon={BarChart3}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <TopProfessionsCard />
        <TopRatedProfessionalsCard />
      </div>
      <GrowthReport />
      <FinancialReport />
      <LocationStats />
    </div>
  )
}
