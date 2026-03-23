'use client'

import { useCallback, useEffect, useState } from 'react'

import { RotateCcw, Search, Star, Trash2 } from 'lucide-react'
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
import type { AvaliacaoListItem } from '@/services/admin-avaliacoes-fetch'
import {
  deleteAvaliacao,
  listAvaliacoes,
  restoreAvaliacao,
  suspendAvaliacao,
} from '@/services/admin-avaliacoes-fetch'

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
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
        search: params.search || undefined,
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
  }, [token, params.page, params.search, params.sortBy, params.sortOrder, params.status])

  useEffect(() => {
    fetchAvaliacoes()
  }, [fetchAvaliacoes])

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

  if (isLoading) {
    return <LoadingSkeleton variant="table-rows" rowCount={5} />
  }

  if (data.length === 0 && !params.search) {
    return <EmptyState icon={Star} message="Nenhuma avaliação encontrada." />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por autor, profissional, comentário..."
            value={params.search}
            onChange={(e) => setParams({ search: e.target.value || null })}
            className="pl-9"
          />
        </div>
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
          {data.map((item) => (
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
                <div className="flex justify-end gap-2">
                  {item.status === 'suspensa' ||
                  item.status === 'suspendida' ||
                  item.status === 'suspended' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAction({ type: 'restore', item })}
                    >
                      <RotateCcw className="size-4" />
                      Restaurar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAction({ type: 'suspend', item })}
                    >
                      Suspender
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmAction({ type: 'delete', item })}
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
