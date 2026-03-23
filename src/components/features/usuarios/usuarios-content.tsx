'use client'

import { useState } from 'react'

import { Users } from 'lucide-react'

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
        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            setRefreshKey((k) => k + 1)
            setCreateDialogOpen(false)
          }}
        />
      </PageHeader>
      <UserList refreshKey={refreshKey} onEmptyAction={() => setCreateDialogOpen(true)} />
    </div>
  )
}
