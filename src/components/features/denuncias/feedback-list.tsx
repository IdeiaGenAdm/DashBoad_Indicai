'use client'

import { useCallback, useEffect, useState } from 'react'

import { Eye, Flag, Mail, Pencil, Trash2 } from 'lucide-react'
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
import { SearchInput } from '@/components/ui/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { formatDateDMY } from '@/lib/utils'
import type { RelatorioListItem } from '@/services/admin-relatorios-fetch'
import { deleteRelatorio, listRelatorios } from '@/services/admin-relatorios-fetch'

import { RespondFeedbackDialog } from './respond-feedback-dialog'

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(''),
  tipo: parseAsString.withDefault(''),
  estado: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
}

export function FeedbackList() {
  const { token } = useAuth()
  const [params, setParams] = useQueryStates(PARAMS)
  const [data, setData] = useState<RelatorioListItem[]>([])
  const [, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [respondItem, setRespondItem] = useState<RelatorioListItem | null>(null)
  const [detailItem, setDetailItem] = useState<RelatorioListItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<RelatorioListItem | null>(null)

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await listRelatorios(token, {
        page: params.page,
        limit: 10,
        search: params.q || undefined,
        tipo: params.tipo || undefined,
        estado: params.estado || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
      })
      const items = Array.isArray(res.relatorios)
        ? res.relatorios
        : ((res as { data?: RelatorioListItem[] }).data ?? [])
      setData(items)
      setTotal(res.total ?? items.length)
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar relatórios')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [token, params.page, params.q, params.tipo, params.estado, params.sortBy, params.sortOrder])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (params.q && params.page !== 1) {
      setParams({ page: 1 })
    }
  }, [params.q, params.page, setParams])

  async function handleDelete() {
    if (!token || !confirmDelete) return
    try {
      await deleteRelatorio(token, confirmDelete.tipo ?? 'reclamacao', confirmDelete.id)
      toast.success('Relatório eliminado')
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

  function hasEmail(item: RelatorioListItem): boolean {
    const email = item.autorEmail ?? (item as { email?: string }).email
    return typeof email === 'string' && email.trim().length > 0
  }

  const showEmpty = !isLoading && data.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Pesquisar..." />
        <Select
          value={params.tipo || 'all'}
          onValueChange={(v) => setParams({ tipo: v === 'all' ? null : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="denuncia">Denúncia</SelectItem>
            <SelectItem value="sugestao">Sugestão</SelectItem>
            <SelectItem value="reclamacao">Reclamação</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={params.estado || 'all'}
          onValueChange={(v) => setParams({ estado: v === 'all' ? null : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="respondido">Respondido</SelectItem>
            <SelectItem value="fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showEmpty ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border/50 bg-muted/20">
          <EmptyState icon={Flag} message="Nenhuma denúncia, sugestão ou reclamação encontrada." />
        </div>
      ) : (
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Tipo</DataTableHead>
              <DataTableHead>Autor</DataTableHead>
              <DataTableHead>Mensagem</DataTableHead>
              <DataTableHead>Estado</DataTableHead>
              <DataTableHead>Data</DataTableHead>
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
                  <DataTableCell className="font-medium capitalize">
                    {typeof item.tipo === 'string' ? item.tipo : '-'}
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex items-center gap-1">
                      {hasEmail(item) ? (
                        <Mail className="size-4 text-muted-foreground" />
                      ) : (
                        <span className="text-xs text-muted-foreground">sem email</span>
                      )}
                      {typeof item.autorNome === 'string'
                        ? item.autorNome
                        : typeof item.autorEmail === 'string'
                          ? item.autorEmail
                          : '-'}
                    </div>
                  </DataTableCell>
                  <DataTableCell className="max-w-[200px] truncate">
                    {typeof item.mensagem === 'string' ? item.mensagem : '-'}
                  </DataTableCell>
                  <DataTableCell className="capitalize">
                    {item.estado ?? item.status ?? '-'}
                  </DataTableCell>
                  <DataTableCell>
                    {typeof item.createdAt === 'string' ? formatDateDMY(item.createdAt) : '-'}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRespondItem(item)}
                        disabled={!hasEmail(item)}
                        title={hasEmail(item) ? 'Responder' : 'Autor sem email'}
                        className="h-8 px-2.5"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-destructive hover:text-destructive"
                        onClick={() => setConfirmDelete(item)}
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
      )}

      <Dialog open={!!detailItem} onOpenChange={(o) => !o && setDetailItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhe do relatório</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {detailItem && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Tipo:</span> {detailItem.tipo ?? '-'}
              </p>
              <p>
                <span className="font-medium">Autor:</span>{' '}
                {detailItem.autorNome ?? detailItem.autorEmail ?? '-'}
              </p>
              <p>
                <span className="font-medium">Mensagem:</span> {detailItem.mensagem ?? '-'}
              </p>
              <p>
                <span className="font-medium">Estado:</span>{' '}
                {detailItem.estado ?? detailItem.status ?? '-'}
              </p>
              <p>
                <span className="font-medium">Data:</span>{' '}
                {detailItem.createdAt ? formatDateDMY(detailItem.createdAt) : '-'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar relatório</DialogTitle>
            <DialogDescription>
              Eliminar este {confirmDelete?.tipo ?? 'relatório'}? Esta ação não pode ser revertida.
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
      <RespondFeedbackDialog
        item={respondItem}
        open={!!respondItem}
        onOpenChange={(open) => !open && setRespondItem(null)}
        onSuccess={fetchData}
      />
    </div>
  )
}
