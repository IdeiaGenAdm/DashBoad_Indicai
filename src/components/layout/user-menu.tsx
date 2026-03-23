'use client'

import { useState } from 'react'

import { KeyRound, LogOut, User } from 'lucide-react'

import { ChangePasswordForm } from '@/components/features/settings/change-password-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  const nome = (user?.nomeCompleto ?? user?.nome ?? 'Admin') as string

  return (
    <div className="flex items-center gap-2">
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="size-4" />
              <span className="hidden max-w-24 truncate sm:inline">{nome}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => setChangePasswordOpen(true)}>
              <KeyRound className="mr-2 size-4" />
              Alterar senha
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => logout()}>
              <LogOut className="mr-2 size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <ChangePasswordForm onSuccess={() => setChangePasswordOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
