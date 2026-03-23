import { Flag } from 'lucide-react'

import { FeedbackList } from '@/components/features/denuncias/feedback-list'
import { PageHeader } from '@/components/ui/page-header'

export default function DenunciasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Denúncias"
        description="Gestão de denúncias, sugestões e reclamações"
        icon={Flag}
      />
      <FeedbackList />
    </div>
  )
}
