import { Briefcase } from 'lucide-react'

import { ProfissionaisList } from '@/components/features/profissionais/profissionais-list'
import { PageHeader } from '@/components/ui/page-header'

export default function ProfissionaisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profissionais"
        description="Gestão de profissionais e planos de subscrição"
        icon={Briefcase}
      />
      <ProfissionaisList />
    </div>
  )
}
