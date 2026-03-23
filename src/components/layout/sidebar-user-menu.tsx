'use client'

import { useState } from 'react'

import Link from 'next/link'

import { KeyRound, LogOut, Settings } from 'lucide-react'
import { motion } from 'motion/react'

import { ChangePasswordForm } from '@/components/features/settings/change-password-form'
import { useAceternitySidebar } from '@/components/layout/aceternity-sidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'

export function SidebarUserMenu({ onLogout }: { onLogout: () => void }) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const { user } = useAuth()
  const { isExpanded, animate } = useAceternitySidebar()

  const nome = (user?.nomeCompleto ?? user?.nome ?? 'Administrador') as string
  const firstLetter = (nome.trim()[0] ?? 'U').toUpperCase()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group/sidebar flex w-full min-w-0 items-center justify-start gap-2 rounded-md py-2 text-left text-neutral-400 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              {firstLetter}
            </div>
            <motion.span
              animate={{
                display: animate ? (isExpanded ? 'inline-block' : 'none') : 'inline-block',
                opacity: animate ? (isExpanded ? 1 : 0) : 1,
              }}
              className="truncate text-left text-sm font-medium text-neutral-700 dark:text-neutral-200"
            >
              {nome}
            </motion.span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/sistema" className="flex cursor-pointer items-center gap-2">
              <Settings className="size-4" />
              Configurações
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setChangePasswordOpen(true)}>
            <KeyRound className="size-4" />
            Alterar senha
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="size-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <ChangePasswordForm onSuccess={() => setChangePasswordOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
