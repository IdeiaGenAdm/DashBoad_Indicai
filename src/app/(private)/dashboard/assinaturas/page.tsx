import { CreditCard } from 'lucide-react'

import { ActiveSubscriptionsTable } from '@/components/features/profissionais/active-subscriptions-table'
import { PageHeader } from '@/components/ui/page-header'

export default function AssinaturasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Assinaturas"
        description="Gestão de assinaturas ativas, vencimentos e cobrança"
        icon={CreditCard}
      />
      <ActiveSubscriptionsTable />
    </div>
  )
}
