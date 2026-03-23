import { BannersList } from '@/components/features/banners/banners-list'

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Banners</h1>
        <p className="text-muted-foreground">Gestão de banners promocionais.</p>
      </div>
      <BannersList />
    </div>
  )
}
