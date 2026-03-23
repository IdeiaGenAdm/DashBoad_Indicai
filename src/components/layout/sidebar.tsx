'use client'

import {
  BarChart3,
  Briefcase,
  Flag,
  Image,
  LayoutDashboard,
  Settings,
  Star,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'

import { Separator } from '@/components/ui/separator'

import {
  AceternitySidebar,
  type AceternitySidebarLink,
  DesktopSidebar,
  MobileSidebar,
  SidebarBody,
  SidebarLink,
  useAceternitySidebar,
} from '@/components/layout/aceternity-sidebar'
import { SidebarUserMenu } from '@/components/layout/sidebar-user-menu'

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
  const { isExpanded, animate } = useAceternitySidebar()
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden py-4">
      <div className="flex min-w-0 shrink-0 items-center gap-2 px-2">
        <span className="shrink-0 text-lg font-bold text-primary">I</span>
        <motion.span
          animate={{
            display: animate ? (isExpanded ? 'inline-block' : 'none') : 'inline-block',
            opacity: animate ? (isExpanded ? 1 : 0) : 1,
          }}
          className="truncate text-lg font-bold text-primary"
        >
          ndicai
        </motion.span>
      </div>
      <Separator className="my-2 bg-primary/20" />
      <nav className="min-h-0 flex-1 overflow-y-auto px-2">
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <SidebarLink key={link.href} link={link} />
          ))}
        </div>
      </nav>
      <div className="absolute inset-x-0 bottom-0 border-t border-primary/20 bg-sidebar px-2 py-4">
        <SidebarUserMenu onLogout={onLogout} />
      </div>
      <div className="h-16 shrink-0" aria-hidden />
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
        <SidebarBody className="shrink-0 border-primary/20 bg-sidebar max-md:border-b md:border-r dark:bg-neutral-950">
          <SidebarNavContent onLogout={onLogout} />
        </SidebarBody>
        <div className="flex min-h-svh min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AceternitySidebar>
  )
}
