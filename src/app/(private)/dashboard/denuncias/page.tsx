import { FeedbackList } from '@/components/features/denuncias/feedback-list'

export default function DenunciasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Denúncias</h1>
        <p className="text-muted-foreground">Gestão de denúncias, sugestões e reclamações.</p>
      </div>
      <FeedbackList />
    </div>
  )
}
