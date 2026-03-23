'use client'

import { useState } from 'react'

import Link from 'next/link'

import { BarChart3, Briefcase, Flag, Image, PlusCircle, Sparkles, Users } from 'lucide-react'

import { CreateUserDialog } from '@/components/features/usuarios/create-user-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ACTIONS = [
  {
    label: 'Utilizadores',
    description: 'Gerir contas',
    href: '/dashboard/usuarios',
    icon: Users,
  },
  {
    label: 'Profissionais',
    description: 'Gerir perfis',
    href: '/dashboard/profissionais',
    icon: Briefcase,
  },
  {
    label: 'Denúncias',
    description: 'Moderação',
    href: '/dashboard/denuncias',
    icon: Flag,
  },
  {
    label: 'Relatórios',
    description: 'Analytics',
    href: '/dashboard/relatorios',
    icon: BarChart3,
  },
  {
    label: 'Banners',
    description: 'Promocionais',
    href: '/dashboard/banners',
    icon: Image,
  },
] as const

export function QuickActions() {
  const [createUserOpen, setCreateUserOpen] = useState(false)

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-5 text-primary" />
          Ações rápidas
        </CardTitle>
        <CardDescription>Aceda diretamente às principais funcionalidades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <button
            type="button"
            onClick={() => setCreateUserOpen(true)}
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm transition-all duration-150 hover:border-primary hover:bg-primary/10 hover:shadow-md"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 transition-colors group-hover:bg-primary/30">
              <PlusCircle className="size-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-xs leading-tight font-semibold">Criar</p>
              <p className="text-xs leading-tight text-muted-foreground">utilizador</p>
            </div>
          </button>

          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-center gap-2.5 rounded-xl border bg-card p-4 shadow-sm transition-all duration-150 hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs leading-tight font-semibold">{action.label}</p>
                  <p className="text-xs leading-tight text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>

      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        onSuccess={() => setCreateUserOpen(false)}
      />
    </Card>
  )
}
