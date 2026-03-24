'use client'

import { useCallback, useEffect, useState } from 'react'

import { Briefcase, Eye, Pencil, Trash2 } from 'lucide-react'
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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { SearchInput } from '@/components/ui/search-input'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { formatDateDMY } from '@/lib/utils'
import type { ProfessionalListItem } from '@/services/admin-profissionais-fetch'
import { listProfessionals } from '@/services/admin-profissionais-fetch'
import { deleteUser } from '@/services/admin-users-fetch'

import { UserDetailDialog } from '../usuarios/user-detail-dialog'
import { SubscriptionEditDialog } from './subscription-edit-dialog'

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
}

export function ProfissionaisList() {
  const { token } = useAuth()
  const [params, setParams] = useQueryStates(PARAMS)
  const [data, setData] = useState<ProfessionalListItem[]>([])
  const [, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [editProfessional, setEditProfessional] = useState<ProfessionalListItem | null>(null)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ProfessionalListItem | null>(null)

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await listProfessionals(token, {
        page: params.page,
        limit: 10,
        search: params.q || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
      })
      const items = Array.isArray(res.professionals) ? res.professionals : []
      const safeItems = items.filter(
        (item): item is ProfessionalListItem => !!item && typeof item === 'object'
      )
      setData(safeItems)
      setTotal(res.total ?? safeItems.length)
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar profissionais')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [token, params.page, params.q, params.sortBy, params.sortOrder])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (params.q && params.page !== 1) {
      setParams({ page: 1 })
    }
  }, [params.q, params.page, setParams])

  async function handleDelete() {
    if (!token || !confirmDelete?.userId) return
    try {
      await deleteUser(token, confirmDelete.userId)
      toast.success('Profissional eliminado')
      setConfirmDelete(null)
      fetchData()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao eliminar')
    }
  }

  function displayName(item: ProfessionalListItem | null | undefined): string {
    if (!item) return '-'
    return (
      (typeof item.nomeCompleto === 'string' ? item.nomeCompleto : null) ??
      (typeof item.nome === 'string' ? item.nome : null) ??
      '-'
    )
  }

  function detailId(item: ProfessionalListItem): string | null {
    if (typeof item.userId === 'string' && item.userId) return item.userId
    const profissionalId = (item as { profissionalId?: unknown }).profissionalId
    if (typeof profissionalId === 'string' && profissionalId) return profissionalId
    return null
  }

  const showEmpty = !isLoading && data.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Pesquisar por nome, profissão..." />
      </div>

      {showEmpty ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border/50 bg-muted/20">
          <EmptyState icon={Briefcase} message="Nenhum profissional encontrado." />
        </div>
      ) : (
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Nome</DataTableHead>
              <DataTableHead>Profissão</DataTableHead>
              <DataTableHead>Plano</DataTableHead>
              <DataTableHead>Rating</DataTableHead>
              <DataTableHead>Expira em</DataTableHead>
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
              data.map((item) => (
                <DataTableRow key={item.id}>
                  <DataTableCell className="font-medium">{displayName(item)}</DataTableCell>
                  <DataTableCell className="capitalize">
                    {typeof item.profissao === 'string' ? item.profissao : '-'}
                  </DataTableCell>
                  <DataTableCell>{typeof item.plano === 'string' ? item.plano : '-'}</DataTableCell>
                  <DataTableCell>
                    {typeof item.rating === 'number' ? item.rating.toFixed(1) : '-'}
                  </DataTableCell>
                  <DataTableCell>
                    {typeof item.expiresAt === 'string' && item.expiresAt
                      ? formatDateDMY(item.expiresAt)
                      : 'Nunca'}
                  </DataTableCell>
                  <DataTableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const id = detailId(item)
                          if (id) setDetailUserId(id)
                        }}
                        title={detailId(item) ? 'Ver detalhes' : 'Detalhes indisponíveis'}
                        className="h-8 px-2.5"
                        disabled={!detailId(item)}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditProfessional(item)}
                        title="Editar"
                        className="h-8 px-2.5"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-destructive hover:text-destructive"
                        onClick={() => item.userId && setConfirmDelete(item)}
                        title={item.userId ? 'Eliminar' : 'Eliminar através de Utilizadores'}
                        disabled={!item.userId}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      )}

      <UserDetailDialog
        userId={detailUserId}
        open={!!detailUserId}
        onOpenChange={(open) => !open && setDetailUserId(null)}
        onSuccess={fetchData}
      />
      <SubscriptionEditDialog
        professional={editProfessional}
        open={!!editProfessional}
        onOpenChange={(open) => !open && setEditProfessional(null)}
        onSuccess={fetchData}
      />
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar profissional</DialogTitle>
            <DialogDescription>
              Eliminar a conta do profissional {displayName(confirmDelete)}? Esta ação não pode ser
              revertida.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
