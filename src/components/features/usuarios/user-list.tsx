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
            {data.map((user) => (
              <DataTableRow key={user.id}>
                <DataTableCell className="font-medium">
                  {typeof user.nomeCompleto === 'string'
                    ? user.nomeCompleto
                    : typeof user.nome === 'string'
                      ? user.nome
                      : '-'}
                </DataTableCell>
                <DataTableCell>{user.email ?? '-'}</DataTableCell>
                <DataTableCell>{user.tipoUsuario ?? '-'}</DataTableCell>
                <DataTableCell>
                  <span
                    className={
                      user.status === 'bloqueado'
                        ? 'text-destructive'
                        : user.status === 'desativado'
                          ? 'text-muted-foreground'
                          : ''
                    }
                  >
                    {user.status ?? 'ativo'}
                  </span>
                </DataTableCell>
                <DataTableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setDetailUserId(user.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="mr-1 size-4" />
                      Ver detalhes
                    </Button>
                    {user.status === 'bloqueado' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmAction({ type: 'unban', user })}
                      >
                        Desbloquear
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmAction({ type: 'ban', user })}
                      >
                        <Ban className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirmAction({ type: 'delete', user })}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
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
