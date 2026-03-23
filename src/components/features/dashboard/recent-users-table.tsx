'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { ArrowRight, Users } from 'lucide-react'
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

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
      {initials || '?'}
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>
  const styles: Record<string, string> = {
    ativo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    bloqueado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    desativado: 'bg-muted text-muted-foreground',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status.toLowerCase()] ?? 'bg-muted text-muted-foreground'}`}
    >
      {status}
    </span>
  )
}

function TypeBadge({ type }: { type?: string }) {
  if (!type) return <span className="text-xs text-muted-foreground">—</span>
  const styles: Record<string, string> = {
    profissional: 'bg-primary/15 text-primary dark:bg-primary/20',
    cliente: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    empresa: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[type.toLowerCase()] ?? 'bg-muted text-muted-foreground'}`}
    >
      {type}
    </span>
  )
}

export function RecentUsersTable() {
  const { token } = useAuth()
  const [users, setUsers] = useState<UserListItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    listUsers(token, { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
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

  const header = (
    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Users className="size-4 text-primary" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">Últimos utilizadores</CardTitle>
          <CardDescription className="text-xs">5 registos mais recentes</CardDescription>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="gap-1 text-xs text-muted-foreground hover:text-primary"
      >
        <Link href="/dashboard/usuarios">
          Ver todos
          <ArrowRight className="size-3" />
        </Link>
      </Button>
    </CardHeader>
  )

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        {header}
        <CardContent>
          <LoadingSkeleton variant="table-rows" rowCount={5} />
        </CardContent>
      </Card>
    )
  }

  if (!users || users.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        {header}
        <CardContent>
          <EmptyState icon={Users} message="Nenhum utilizador encontrado." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      {header}
      <CardContent className="p-0">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Nome</DataTableHead>
              <DataTableHead className="hidden sm:table-cell">Email</DataTableHead>
              <DataTableHead>Tipo</DataTableHead>
              <DataTableHead>Status</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {users.map((u, i) => (
              <DataTableRow key={u.id ?? i}>
                <DataTableCell>
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={displayName(u)} />
                    <span className="max-w-[120px] truncate text-sm font-medium">
                      {displayName(u)}
                    </span>
                  </div>
                </DataTableCell>
                <DataTableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                  {u.email ?? '—'}
                </DataTableCell>
                <DataTableCell>
                  <TypeBadge type={u.tipoUsuario} />
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={u.status} />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </CardContent>
    </Card>
  )
}
