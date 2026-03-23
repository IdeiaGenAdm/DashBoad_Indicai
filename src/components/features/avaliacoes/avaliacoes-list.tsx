'use client'

import { useCallback, useEffect, useState } from 'react'

import { Eye, Pause, RotateCcw, Star, Trash2 } from 'lucide-react'
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
import { SearchInput } from '@/components/ui/search-input'
import { AdminApiError } from '@/lib/api'
import { formatDateDMY } from '@/lib/utils'
import type { AvaliacaoListItem } from '@/services/admin-avaliacoes-fetch'
import {
  deleteAvaliacao,
  listAvaliacoes,
  restoreAvaliacao,
  suspendAvaliacao,
} from '@/services/admin-avaliacoes-fetch'

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
  status: parseAsString.withDefault(''),
}

export function AvaliacoesList() {
  const { token } = useAuth()
  const [params, setParams] = useQueryStates(PARAMS)
  const [data, setData] = useState<AvaliacaoListItem[]>([])
  const [, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [detailItem, setDetailItem] = useState<AvaliacaoListItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'restore' | 'delete'
    item: AvaliacaoListItem
  } | null>(null)

  const fetchAvaliacoes = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await listAvaliacoes(token, {
        page: params.page,
        limit: 10,
        search: params.q || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
        status: params.status || undefined,
      })
      const items = Array.isArray(res.avaliacoes)
        ? res.avaliacoes
        : ((res as { data?: AvaliacaoListItem[] }).data ?? [])
      setData(items)
      setTotal(res.total ?? items.length)
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar avaliações')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [token, params.page, params.q, params.sortBy, params.sortOrder, params.status])

  useEffect(() => {
    fetchAvaliacoes()
  }, [fetchAvaliacoes])

  useEffect(() => {
    if (params.q && params.page !== 1) {
      setParams({ page: 1 })
    }
  }, [params.q, params.page, setParams])

  async function handleConfirm() {
    if (!confirmAction || !token) return
    const { type, item } = confirmAction
    try {
      if (type === 'suspend') await suspendAvaliacao(token, item.id)
      else if (type === 'restore') await restoreAvaliacao(token, item.id)
      else if (type === 'delete') await deleteAvaliacao(token, item.id)
      toast.success(
        type === 'suspend'
          ? 'Avaliação suspensa'
          : type === 'restore'
            ? 'Avaliação restaurada'
            : 'Avaliação eliminada'
      )
      setConfirmAction(null)
      fetchAvaliacoes()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro na operação')
    }
  }

  function displayName(item: AvaliacaoListItem): string {
    return (
      (typeof item.autorNome === 'string' ? item.autorNome : null) ??
      (typeof item.profissionalNome === 'string' ? item.profissionalNome : null) ??
      '-'
    )
  }

  const showEmpty = !isLoading && data.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Pesquisar por autor, profissional, comentário..." />
        {params.status && (
          <Button variant="ghost" size="sm" onClick={() => setParams({ status: null })}>
            Limpar filtro status
          </Button>
        )}
      </div>

      <DataTable>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead>Autor / Profissional</DataTableHead>
            <DataTableHead>Rating</DataTableHead>
            <DataTableHead>Comentário</DataTableHead>
            <DataTableHead>Status</DataTableHead>
            <DataTableHead className="text-right">Ações</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {isLoading ? (
            <DataTableRow>
              <DataTableCell colSpan={5} className="h-32 text-center">
                <LoadingSkeleton variant="table-rows" rowCount={3} />
              </DataTableCell>
            </DataTableRow>
          ) : showEmpty ? (
            <DataTableRow>
              <DataTableCell colSpan={5} className="h-32 text-center">
                <EmptyState icon={Star} message="Nenhuma avaliação encontrada." />
              </DataTableCell>
            </DataTableRow>
          ) : (
            data.map((item) => (
            <DataTableRow key={item.id}>
              <DataTableCell className="font-medium">{displayName(item)}</DataTableCell>
              <DataTableCell>
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-primary text-primary" />
                  {typeof item.rating === 'number' ? item.rating.toFixed(1) : '-'}
                </span>
              </DataTableCell>
              <DataTableCell className="max-w-[200px] truncate">
                {typeof item.comentario === 'string' ? item.comentario : '-'}
              </DataTableCell>
              <DataTableCell>
                <span
                  className={
                    item.status === 'suspensa'
                      ? 'text-destructive'
                      : item.status === 'suspendida'
                        ? 'text-destructive'
                        : ''
                  }
                >
                  {item.status ?? 'ativo'}
                </span>
              </DataTableCell>
              <DataTableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailItem(item)}
                    title="Ver detalhes"
                    className="h-8 px-2.5"
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  {item.status === 'suspensa' ||
                  item.status === 'suspendida' ||
                  item.status === 'suspended' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAction({ type: 'restore', item })}
                      title="Restaurar"
                      className="h-8 px-2.5"
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAction({ type: 'suspend', item })}
                      title="Suspender"
                      className="h-8 px-2.5"
                    >
                      <Pause className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-destructive hover:text-destructive"
                    onClick={() => setConfirmAction({ type: 'delete', item })}
                    title="Eliminar"
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

      <Dialog open={!!detailItem} onOpenChange={(o) => !o && setDetailItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhe da avaliação</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {detailItem && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Autor:</span> {displayName(detailItem)}
              </p>
              <p>
                <span className="font-medium">Profissional:</span>{' '}
                {detailItem.profissionalNome ?? '-'}
              </p>
              <p>
                <span className="font-medium">Rating:</span>{' '}
                {typeof detailItem.rating === 'number' ? detailItem.rating.toFixed(1) : '-'}
              </p>
              <p>
                <span className="font-medium">Comentário:</span> {detailItem.comentario ?? '-'}
              </p>
              <p>
                <span className="font-medium">Status:</span> {detailItem.status ?? '-'}
              </p>
              <p>
                <span className="font-medium">Data:</span>{' '}
                {detailItem.createdAt ? formatDateDMY(detailItem.createdAt) : '-'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'suspend' &&
                `Suspender a avaliação de ${displayName(confirmAction.item)}? A avaliação deixará de ser exibida.`}
              {confirmAction?.type === 'restore' &&
                `Restaurar a avaliação de ${displayName(confirmAction.item)}?`}
              {confirmAction?.type === 'delete' &&
                `Eliminar definitivamente esta avaliação? Esta ação não pode ser revertida.`}
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
    </div>
  )
}
