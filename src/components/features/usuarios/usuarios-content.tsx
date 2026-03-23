'use client'

import { useState } from 'react'

import { PlusCircle, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'

import { CreateUserDialog } from './create-user-dialog'
import { UserList } from './user-list'

export function UsuariosContent() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilizadores"
        description="Gestão de contas e permissões da plataforma"
        icon={Users}
      >
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-1.5">
          <PlusCircle className="size-4" />
          Nova conta
        </Button>
      </PageHeader>

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setRefreshKey((k) => k + 1)
          setCreateDialogOpen(false)
        }}
      />

      <UserList refreshKey={refreshKey} onEmptyAction={() => setCreateDialogOpen(true)} />
    </div>
  )
}
