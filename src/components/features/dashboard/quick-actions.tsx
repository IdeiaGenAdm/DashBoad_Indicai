'use client'

import { useState } from 'react'

import Link from 'next/link'

import { BarChart3, Briefcase, Flag, Image, PlusCircle, Sparkles, Users, X } from 'lucide-react'

import { CreateUserDialog } from '@/components/features/usuarios/create-user-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ACTIONS = [
  {
    label: 'Utilizadores',
    href: '/dashboard/usuarios',
    icon: Users,
  },
  {
    label: 'Profissionais',
    href: '/dashboard/profissionais',
    icon: Briefcase,
  },
  {
    label: 'Denúncias',
    href: '/dashboard/denuncias',
    icon: Flag,
  },
  {
    label: 'Relatórios',
    href: '/dashboard/relatorios',
    icon: BarChart3,
  },
  {
    label: 'Banners',
    href: '/dashboard/banners',
    icon: Image,
  },
] as const

export function QuickActions() {
  const [open, setOpen] = useState(false)
  const [createUserOpen, setCreateUserOpen] = useState(false)

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />}

      {open && (
        <div className="fixed right-4 bottom-36 z-50 w-60 md:right-6 md:bottom-20">
          <Card className="overflow-hidden border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Sparkles className="size-4 text-primary" />
                Ações rápidas
              </CardTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateUserOpen(true)
                    setOpen(false)
                  }}
                  className="group flex flex-col items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 p-2.5 transition-all hover:border-primary hover:bg-primary/10"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary/30">
                    <PlusCircle className="size-4 text-primary" />
                  </div>
                  <span className="text-center text-[10px] leading-tight font-semibold">Criar</span>
                </button>

                {ACTIONS.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={() => setOpen(false)}
                      className="group flex flex-col items-center gap-1.5 rounded-lg border bg-card p-2.5 transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <span className="text-center text-[10px] leading-tight font-semibold">
                        {action.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Button
        size="icon"
        onClick={() => setOpen(!open)}
        className="fixed right-4 bottom-20 z-50 size-12 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 md:right-6 md:bottom-6"
        aria-label="Ações rápidas"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </Button>

      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        onSuccess={() => setCreateUserOpen(false)}
      />
    </>
  )
}
