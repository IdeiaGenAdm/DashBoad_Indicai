'use client'

import { useCallback, useEffect, useState } from 'react'

import { Ban, ImageIcon, Search, Trash2, Users as UsersIcon } from 'lucide-react'
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  banUser,
  banUsersBulk,
  deleteUser,
  listUsers,
  unbanUser,
} from '@/services/admin-users-fetch'

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
  const [, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ban' | 'unban' | 'delete'
    user: UserListItem
  } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmBulkBan, setConfirmBulkBan] = useState(false)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await listUsers(token, {
        page: params.page,
        limit: 10,
        search: params.search || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
        status: params.status || undefined,
      })
      const users = Array.isArray(res.users)
        ? res.users
        : ((res as { data?: UserListItem[] }).data ?? [])
      setData(users)
      setTotal(res.total ?? users.length)
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

  const selectableUsers = data.filter((u) => u.status !== 'bloqueado')
  const selectedCount = selectedIds.size
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (selectedCount >= selectableUsers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(selectableUsers.map((u) => u.id)))
    }
  }

  async function handleBulkBan() {
    if (!token || selectedIds.size === 0) return
    try {
      await banUsersBulk(token, Array.from(selectedIds))
      toast.success(`${selectedIds.size} utilizador(es) bloqueado(s)`)
      setSelectedIds(new Set())
      setConfirmBulkBan(false)
      fetchUsers()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao bloquear em massa')
    }
  }

  if (isLoading) {
    return <LoadingSkeleton variant="table-rows" rowCount={5} />
  }

  if (data.length === 0 && !params.search) {
    return (
      <EmptyState
        icon={UsersIcon}
        message="Nenhum utilizador encontrado."
        action={onEmptyAction ? { label: 'Criar conta', onClick: onEmptyAction } : undefined}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, email..."
            value={params.search}
            onChange={(e) => setParams({ search: e.target.value || null })}
            className="pl-9"
          />
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedCount} selecionado(s)</span>
            <Button variant="destructive" size="sm" onClick={() => setConfirmBulkBan(true)}>
              <Ban className="mr-1 size-4" />
              Bloquear selecionados
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Limpar
            </Button>
          </div>
        )}
      </div>

      <DataTable>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead className="w-12">
              {selectableUsers.length > 0 && (
                <Checkbox
                  checked={selectedCount > 0 && selectedCount >= selectableUsers.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                />
              )}
            </DataTableHead>
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
              <DataTableCell className="w-12">
                {user.status !== 'bloqueado' && (
                  <Checkbox
                    checked={selectedIds.has(user.id)}
                    onCheckedChange={() => toggleSelect(user.id)}
                    aria-label={`Selecionar ${user.nomeCompleto ?? user.email}`}
                  />
                )}
              </DataTableCell>
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
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailUserId(user.id)}
                    title="Gerir fotos"
                  >
                    <ImageIcon className="size-4" />
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

      <Dialog open={confirmBulkBan} onOpenChange={setConfirmBulkBan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear utilizadores em massa</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja bloquear {selectedCount} utilizador(es)? Eles não poderão
              aceder à plataforma até serem desbloqueados. Esta ação pode ser revertida
              individualmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBulkBan(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleBulkBan}>
              Bloquear {selectedCount} utilizador(es)
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
