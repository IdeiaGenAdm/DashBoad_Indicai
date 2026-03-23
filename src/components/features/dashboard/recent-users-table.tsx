'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import type { UserListItem } from '@/services/admin-users-fetch'
import { listUsers } from '@/services/admin-users-fetch'

export function RecentUsersTable() {
  const { token } = useAuth()
  const [users, setUsers] = useState<UserListItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    listUsers(token, {
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
      .then((res) => {
        const list = res.users ?? []
        setUsers(Array.isArray(list) ? list : [])
      })
      .catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) {
          setUsers([])
          return
        }
        toast.error(e instanceof Error ? e.message : 'Erro ao carregar utilizadores')
        setUsers(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const displayName = (u: UserListItem) =>
    u.nomeCompleto ?? u.nome ?? (u as { fullName?: string }).fullName ?? 'N/A'
  const displayType = (u: UserListItem) => u.tipoUsuario ?? '—'

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-5" />
            Últimos utilizadores
          </CardTitle>
          <CardDescription>Os 5 utilizadores mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton variant="cards" rowCount={5} />
        </CardContent>
      </Card>
    )
  }

  if (!users || users.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-5" />
            Últimos utilizadores
          </CardTitle>
          <CardDescription>Os 5 utilizadores mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState icon={Users} message="Nenhum utilizador encontrado." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-5" />
            Últimos utilizadores
          </CardTitle>
          <CardDescription>Os 5 utilizadores mais recentes</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/usuarios">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Nome</DataTableHead>
              <DataTableHead>Email</DataTableHead>
              <DataTableHead>Tipo</DataTableHead>
              <DataTableHead>Status</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {users.map((u, i) => (
              <DataTableRow key={u.id ?? i}>
                <DataTableCell className="font-medium">{displayName(u)}</DataTableCell>
                <DataTableCell className="text-muted-foreground">{u.email ?? '—'}</DataTableCell>
                <DataTableCell className="capitalize">{displayType(u)}</DataTableCell>
                <DataTableCell>{u.status ?? '—'}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </CardContent>
    </Card>
  )
}
