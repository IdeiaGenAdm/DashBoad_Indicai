'use client'

import { useState } from 'react'

import { CreateUserDialog } from './create-user-dialog'
import { UserList } from './user-list'

export function UsuariosContent() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            setRefreshKey((k) => k + 1)
            setCreateDialogOpen(false)
          }}
        />
      </div>
      <UserList refreshKey={refreshKey} onEmptyAction={() => setCreateDialogOpen(true)} />
    </div>
  )
}
