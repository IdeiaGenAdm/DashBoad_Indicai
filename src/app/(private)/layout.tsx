import { PrivateLayoutGuard } from '@/components/private-layout-guard'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <PrivateLayoutGuard>{children}</PrivateLayoutGuard>
}
