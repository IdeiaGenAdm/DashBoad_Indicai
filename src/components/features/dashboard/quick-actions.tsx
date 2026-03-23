'use client'

import { useState } from 'react'

import Link from 'next/link'

import { BarChart3, Briefcase, Flag, Image, PlusCircle, Sparkles, Users } from 'lucide-react'

import { CreateUserDialog } from '@/components/features/usuarios/create-user-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ACTIONS = [
  { label: 'Ver utilizadores', href: '/dashboard/usuarios', icon: Users },
  { label: 'Ver profissionais', href: '/dashboard/profissionais', icon: Briefcase },
  { label: 'Ver denúncias', href: '/dashboard/denuncias', icon: Flag },
  { label: 'Ver relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { label: 'Gerir banners', href: '/dashboard/banners', icon: Image },
] as const

export function QuickActions() {
  const [createUserOpen, setCreateUserOpen] = useState(false)

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-5 text-primary" />
          Ações rápidas
        </CardTitle>
        <CardDescription>
          Aceda rapidamente às principais funcionalidades do dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateUserOpen(true)}
            className="gap-1.5"
          >
            <PlusCircle className="size-4" />
            Criar utilizador
          </Button>
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Button key={action.href} variant="outline" size="sm" asChild className="gap-1.5">
                <Link href={action.href}>
                  <Icon className="size-4" />
                  {action.label}
                </Link>
              </Button>
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
