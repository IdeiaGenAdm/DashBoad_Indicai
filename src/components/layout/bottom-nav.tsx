'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  LayoutDashboard,
  Users,
  Briefcase,
  Star,
  Flag,
  BarChart3,
  Image,
  Settings,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/** Mesmos destinos do sidebar */
const MOBILE_LINKS = [
  { label: 'Início', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Usuários', href: '/dashboard/usuarios', icon: Users },
  { label: 'Profissionais', href: '/dashboard/profissionais', icon: Briefcase },
  { label: 'Avaliações', href: '/dashboard/avaliacoes', icon: Star },
  { label: 'Denúncias', href: '/dashboard/denuncias', icon: Flag },
  { label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { label: 'Banners', href: '/dashboard/banners', icon: Image },
  { label: 'Sistema', href: '/dashboard/sistema', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center overflow-x-auto border-t border-primary/20 bg-neutral-900 px-1 py-2 dark:bg-neutral-950 [&::-webkit-scrollbar]:hidden">
      {MOBILE_LINKS.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex shrink-0 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs transition-colors',
              isActive ? 'text-primary' : 'text-neutral-400 hover:text-primary'
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
