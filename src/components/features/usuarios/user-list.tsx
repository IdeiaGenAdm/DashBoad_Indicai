'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react'
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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { SearchInput } from '@/components/ui/search-input'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { type ExportColumn, exportRowsToCsv, exportRowsToPdf } from '@/lib/export-data'
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

function userName(user: UserListItem): string {
  return (
    (typeof user.nomeCompleto === 'string' ? user.nomeCompleto : null) ??
    (typeof user.nome === 'string' ? user.nome : null) ??
    '-'
  )
}

const USER_EXPORT_COLUMNS: ExportColumn<UserListItem>[] = [
  { label: 'Nome', value: userName },
  { label: 'Email', value: (user) => user.email ?? '-' },
  { label: 'CPF', value: (user) => user.cpf ?? '-' },
  { label: 'Tipo', value: (user) => user.tipoUsuario ?? '-' },
  { label: 'Status', value: (user) => user.status ?? 'ativo' },
  { label: 'Criado em', value: (user) => user.createdAt ?? '-' },
]

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
  status: parseAsString.withDefault(''),
}

function getTotalFromResponse(res: unknown): number | null {
  if (!res || typeof res !== 'object') return null
  const record = res as Record<string, unknown>
  const pagination =
    record.pagination && typeof record.pagination === 'object'
      ? (record.pagination as Record<string, unknown>)
      : null
  const value = record.total ?? pagination?.total
  return typeof value === 'number' && Number.isFinite(value) ? value : null
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
  const [total, setTotal] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Record<string, UserListItem>>({})
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
        search: params.q || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
        status: params.status || undefined,
      })
      const users = Array.isArray(res.users)
        ? res.users
        : ((res as { data?: UserListItem[] }).data ?? [])
      setData(users)
      setTotal(getTotalFromResponse(res))
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
  }, [token, params.page, params.q, params.sortBy, params.sortOrder, params.status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, refreshKey])

  useEffect(() => {
    if (params.q && params.page !== 1) {
      setParams({ page: 1 })
    }
  }, [params.q, params.page, setParams])

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

  function selectedRows(): UserListItem[] {
    return Object.values(selectedUsers)
  }

  function toggleUserSelection(user: UserListItem, checked: boolean) {
    setSelectedUsers((prev) => {
      const next = { ...prev }
      if (checked) next[user.id] = user
      else delete next[user.id]
      return next
    })
  }

  function togglePageSelection(checked: boolean) {
    setSelectedUsers((prev) => {
      const next = { ...prev }
      for (const user of data) {
        if (checked) next[user.id] = user
        else delete next[user.id]
      }
      return next
    })
  }

  async function fetchAllUsersForExport(): Promise<UserListItem[]> {
    if (!token) return []
    const pageSize = 200
    const all: UserListItem[] = []
    const seen = new Set<string>()

    for (let page = 1; page <= 100; page++) {
      const res = await listUsers(token, {
        page,
        limit: pageSize,
        search: params.q || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
        status: params.status || undefined,
      })
      const users = Array.isArray(res.users)
        ? res.users
        : ((res as { data?: UserListItem[] }).data ?? [])
      for (const user of users) {
        if (!seen.has(user.id)) {
          seen.add(user.id)
          all.push(user)
        }
      }
      const totalFromApi = getTotalFromResponse(res)
      if ((totalFromApi != null && all.length >= totalFromApi) || users.length < pageSize) break
    }

    return all
  }

  async function rowsForExport(): Promise<UserListItem[]> {
    const selected = selectedRows()
    if (selected.length > 0) return selected
    return fetchAllUsersForExport()
  }

  async function handleExportCsv() {
    setIsExporting(true)
    try {
      const rows = await rowsForExport()
      if (rows.length === 0) {
        toast.error('Nenhum dado para exportar')
        return
      }
      exportRowsToCsv('usuarios', USER_EXPORT_COLUMNS, rows)
    } finally {
      setIsExporting(false)
    }
  }

  async function handleExportPdf() {
    setIsExporting(true)
    try {
      const rows = await rowsForExport()
      if (rows.length === 0) {
        toast.error('Nenhum dado para exportar')
        return
      }
      const ok = exportRowsToPdf('Usuarios', USER_EXPORT_COLUMNS, rows)
      if (!ok) toast.error('Nao foi possivel abrir a janela de impressao')
    } finally {
      setIsExporting(false)
    }
  }

  const limit = 12
  const totalPages =
    total == null
      ? params.page + (data.length >= limit ? 1 : 0)
      : Math.max(1, Math.ceil(total / limit))
  const hasPreviousPage = params.page > 1
  const hasNextPage = total == null ? data.length >= limit : params.page < totalPages
  const showPagination = hasPreviousPage || hasNextPage || totalPages > 1
  const hasFilters = params.q || params.status
  const showEmpty = !isLoading && data.length === 0
  const selectedCount = selectedRows().length
  const allPageSelected = data.length > 0 && data.every((user) => selectedUsers[user.id])
  const somePageSelected = data.some((user) => selectedUsers[user.id])

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
          <SearchInput placeholder="Pesquisar por nome, email..." />
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isLoading || isExporting}
              title={selectedCount > 0 ? 'Exportar selecionados' : 'Exportar todos'}
            >
              <Download className="size-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              disabled={isLoading || isExporting}
              title={selectedCount > 0 ? 'Exportar selecionados' : 'Exportar todos'}
            >
              <FileText className="size-4" />
              PDF
            </Button>
            {selectedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedUsers({})}>
                Limpar selecao ({selectedCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl shadow-sm">
        {showEmpty ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border/50 bg-muted/20">
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
          </div>
        ) : (
          <DataTable>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead className="w-10">
                  <Checkbox
                    aria-label="Selecionar usuarios desta pagina"
                    checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false}
                    onCheckedChange={(checked) => togglePageSelection(checked === true)}
                  />
                </DataTableHead>
                <DataTableHead>Nome</DataTableHead>
                <DataTableHead>Email</DataTableHead>
                <DataTableHead>Tipo</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead className="text-right">Ações</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {isLoading ? (
                <DataTableRow>
                  <DataTableCell colSpan={6} className="h-32 text-center">
                    <LoadingSkeleton variant="table-rows" rowCount={3} />
                  </DataTableCell>
                </DataTableRow>
              ) : (
                data.map((user) => {
                  const name = userName(user)
                  return (
                    <DataTableRow key={user.id}>
                      <DataTableCell>
                        <Checkbox
                          aria-label={`Selecionar ${name}`}
                          checked={!!selectedUsers[user.id]}
                          onCheckedChange={(checked) => toggleUserSelection(user, checked === true)}
                        />
                      </DataTableCell>
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
                })
              )}
            </DataTableBody>
          </DataTable>
        )}

        {!isLoading && showPagination && (
          <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {total == null
                ? `Pagina ${params.page} - ${data.length} nesta pagina`
                : `Pagina ${params.page} de ${totalPages} - ${total} utilizador(es)`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams({ page: Math.max(1, params.page - 1) })}
                disabled={!hasPreviousPage}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams({ page: params.page + 1 })}
                disabled={!hasNextPage}
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
