import { Settings } from 'lucide-react'

import { MaintenanceToggle } from '@/components/features/sistema/maintenance-toggle'
import { PageHeader } from '@/components/ui/page-header'

export default function SistemaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistema"
        description="Configurações e manutenção da plataforma"
        icon={Settings}
      />
      <MaintenanceToggle />
    </div>
  )
}
