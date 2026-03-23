'use client'

import {
  BarChart3,
  Briefcase,
  Flag,
  Image,
  LayoutDashboard,
  LogOut,
  Settings,
  Star,
  Users,
} from 'lucide-react'

import {
  AceternitySidebar,
  type AceternitySidebarLink,
  DesktopSidebar,
  MobileSidebar,
  SidebarBody,
  SidebarLink,
} from '@/components/layout/aceternity-sidebar'

const NAV_LINKS: AceternitySidebarLink[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="size-5 shrink-0" /> },
  { label: 'Usuários', href: '/dashboard/usuarios', icon: <Users className="size-5 shrink-0" /> },
  {
    label: 'Profissionais',
    href: '/dashboard/profissionais',
    icon: <Briefcase className="size-5 shrink-0" />,
  },
  {
    label: 'Avaliações',
    href: '/dashboard/avaliacoes',
    icon: <Star className="size-5 shrink-0" />,
  },
  { label: 'Denúncias', href: '/dashboard/denuncias', icon: <Flag className="size-5 shrink-0" /> },
  {
    label: 'Relatórios',
    href: '/dashboard/relatorios',
    icon: <BarChart3 className="size-5 shrink-0" />,
  },
  { label: 'Banners', href: '/dashboard/banners', icon: <Image className="size-5 shrink-0" /> },
  { label: 'Sistema', href: '/dashboard/sistema', icon: <Settings className="size-5 shrink-0" /> },
]

export { NAV_LINKS }

function SidebarNavContent({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <h2 className="px-2 text-lg font-bold text-primary">IndicAI</h2>
      <nav className="flex flex-col gap-1">
        {NAV_LINKS.map((link) => (
          <SidebarLink
            key={link.href}
            link={link}
            className="text-neutral-300 hover:text-primary dark:text-neutral-400 dark:hover:text-primary"
          />
        ))}
      </nav>
      <div className="mt-auto border-t border-primary/20 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-400 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <LogOut className="size-5 shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

export function DashboardSidebar({
  onLogout,
  children,
}: {
  onLogout: () => void
  children: React.ReactNode
}) {
  return (
    <AceternitySidebar>
      <div className="flex min-h-svh w-full flex-col md:flex-row">
        <SidebarBody className="shrink-0 border-primary/20 bg-neutral-900 max-md:border-b md:border-r dark:bg-neutral-950">
          <SidebarNavContent onLogout={onLogout} />
        </SidebarBody>
        <div className="flex min-h-svh flex-1 flex-col">{children}</div>
      </div>
    </AceternitySidebar>
  )
}
