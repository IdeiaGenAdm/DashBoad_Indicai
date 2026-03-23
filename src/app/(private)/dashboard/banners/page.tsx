import { Image } from 'lucide-react'

import { BannersList } from '@/components/features/banners/banners-list'
import { PageHeader } from '@/components/ui/page-header'

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Gestão de banners e conteúdo promocional"
        icon={Image}
      />
      <BannersList />
    </div>
  )
}
