'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react'
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import type { UserListItem } from '@/services/admin-users-fetch'
import { banUser, deleteUser, listUsers, unbanUser } from '@/services/admin-users-fetch'

import { UserDetailDialog } from './user-detail-dialog'

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>
  const styles: Record<string, string> = {
    ativo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    bloqueado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    desativado: 'bg-muted text-muted-foreground',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status.toLowerCase()] ?? 'bg-muted text-muted-foreground'}`}
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[type.toLowerCase()] ?? 'bg-muted text-muted-foreground'}`}
    >
      {type}
    </span>
  )
}

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

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
  status: parseAsString.withDefault(''),
}

export function UserList({
  refreshKey = 0,
  onEmptyAction,
}: {
  refreshKey?: number
  onEmptyAction?: () => void
} = {}) {
  const { token } = useAuth()
  const [params, setParams] = useQueryStates(PARAMS)
  const [data, setData] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ban' | 'unban' | 'delete'
    user: UserListItem
  } | null>(null)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await listUsers(token, {
        page: params.page,
        limit: 12,
        search: params.search || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
        status: params.status || undefined,
      })
      const users = Array.isArray(res.users)
        ? res.users
        : ((res as { data?: UserListItem[] }).data ?? [])
      setData(users)
      setTotal(res.total ?? users.length ?? 0)
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar utilizadores')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [token, params.page, params.search, params.sortBy, params.sortOrder, params.status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, refreshKey])

  async function handleConfirm() {
    if (!confirmAction || !token) return
    const { type, user } = confirmAction
    try {
      if (type === 'ban') await banUser(token, user.id)
      else if (type === 'unban') await unbanUser(token, user.id)
      else if (type === 'delete') await deleteUser(token, user.id)
      toast.success(
        type === 'ban'
          ? 'Utilizador bloqueado'
          : type === 'unban'
            ? 'Utilizador desbloqueado'
            : 'Conta eliminada'
      )
      setConfirmAction(null)
      fetchUsers()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro na operação')
    }
  }

  const limit = 12
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (isLoading) {
    return <LoadingSkeleton variant="table-rows" rowCount={5} />
  }

  if (data.length === 0) {
    const hasFilters = params.search || params.status
    return (
      <EmptyState
        icon={UsersIcon}
        message={
          hasFilters
            ? 'Nenhum utilizador encontrado com os filtros aplicados.'
            : 'Nenhum utilizador encontrado.'
        }
        action={
          !hasFilters && onEmptyAction
            ? { label: 'Criar conta', onClick: onEmptyAction }
            : undefined
        }
      />
    )
  }

  const statusFilters = [
    { value: '', label: 'Todos' },
    { value: 'ativo', label: 'Ativos' },
    { value: 'bloqueado', label: 'Bloqueados' },
    { value: 'desativado', label: 'Desativados' },
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, email..."
              value={params.search}
              onChange={(e) => setParams({ search: e.target.value || null, page: 1 })}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((f) => (
              <Button
                key={f.value}
                variant={params.status === f.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setParams({ status: f.value || null, page: 1 })}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border shadow-sm">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Nome</DataTableHead>
              <DataTableHead>Email</DataTableHead>
              <DataTableHead>Tipo</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead className="text-right">Ações</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {data.map((user) => {
              const name =
                typeof user.nomeCompleto === 'string'
                  ? user.nomeCompleto
                  : typeof user.nome === 'string'
                    ? user.nome
                    : '-'
              return (
                <DataTableRow key={user.id}>
                  <DataTableCell>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={name} />
                      <span className="max-w-[160px] truncate font-medium">{name}</span>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-sm text-muted-foreground">
                    {user.email ?? '-'}
                  </DataTableCell>
                  <DataTableCell>
                    <TypeBadge type={user.tipoUsuario} />
                  </DataTableCell>
                  <DataTableCell>
                    <StatusBadge status={user.status ?? 'ativo'} />
                  </DataTableCell>
                  <DataTableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailUserId(user.id)}
                        title="Ver detalhes"
                        className="h-8 px-2.5"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      {user.status === 'bloqueado' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmAction({ type: 'unban', user })}
                          title="Desbloquear"
                          className="h-8 px-2.5"
                        >
                          <Ban className="size-3.5 text-muted-foreground" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmAction({ type: 'ban', user })}
                          title="Bloquear"
                          className="h-8 px-2.5"
                        >
                          <Ban className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-destructive hover:text-destructive"
                        onClick={() => setConfirmAction({ type: 'delete', user })}
                        title="Eliminar conta"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              )
            })}
          </DataTableBody>
        </DataTable>

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Página {params.page} de {totalPages} · {total} utilizador(es)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams({ page: Math.max(1, params.page - 1) })}
                disabled={params.page <= 1}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams({ page: Math.min(totalPages, params.page + 1) })}
                disabled={params.page >= totalPages}
              >
                Próxima
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'ban' &&
                `Bloquear ${confirmAction.user.nomeCompleto ?? confirmAction.user.email}? O utilizador não poderá aceder à plataforma.`}
              {confirmAction?.type === 'unban' &&
                `Desbloquear ${confirmAction.user.nomeCompleto ?? confirmAction.user.email}?`}
              {confirmAction?.type === 'delete' &&
                `Eliminar definitivamente a conta de ${confirmAction.user.nomeCompleto ?? confirmAction.user.email}? Esta ação não pode ser revertida.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancelar
            </Button>
            <Button
              variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserDetailDialog
        userId={detailUserId}
        open={!!detailUserId}
        onOpenChange={(open) => !open && setDetailUserId(null)}
        onSuccess={fetchUsers}
      />
    </div>
  )
}
