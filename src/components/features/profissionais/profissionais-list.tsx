'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Pencil,
  Trash2,
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

function professionalName(item: ProfessionalListItem | null | undefined): string {
  if (!item) return '-'
  return (
    (typeof item.nomeCompleto === 'string' ? item.nomeCompleto : null) ??
    (typeof item.nome === 'string' ? item.nome : null) ??
    '-'
  )
}

const PROFESSIONAL_EXPORT_COLUMNS: ExportColumn<ProfessionalListItem>[] = [
  { label: 'Nome', value: professionalName },
  { label: 'Profissao', value: (item) => item.profissao ?? '-' },
  { label: 'Plano', value: (item) => item.plano ?? '-' },
  {
    label: 'Rating',
    value: (item) => (typeof item.rating === 'number' ? item.rating.toFixed(1) : '-'),
  },
  {
    label: 'Expira em',
    value: (item) =>
      typeof item.expiresAt === 'string' && item.expiresAt
        ? formatDateDMY(item.expiresAt)
        : 'Nunca',
  },
]

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

export function ProfissionaisList() {
  const { token } = useAuth()
  const [params, setParams] = useQueryStates(PARAMS)
  const [data, setData] = useState<ProfessionalListItem[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedProfessionals, setSelectedProfessionals] = useState<
    Record<string, ProfessionalListItem>
  >({})
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
      setTotal(getTotalFromResponse(res))
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
    return professionalName(item)
  }

  function detailId(item: ProfessionalListItem): string | null {
    if (typeof item.userId === 'string' && item.userId) return item.userId
    const profissionalId = (item as { profissionalId?: unknown }).profissionalId
    if (typeof profissionalId === 'string' && profissionalId) return profissionalId
    return null
  }

  function selectedRows(): ProfessionalListItem[] {
    return Object.values(selectedProfessionals)
  }

  function toggleProfessionalSelection(item: ProfessionalListItem, checked: boolean) {
    setSelectedProfessionals((prev) => {
      const next = { ...prev }
      if (checked) next[item.id] = item
      else delete next[item.id]
      return next
    })
  }

  function togglePageSelection(checked: boolean) {
    setSelectedProfessionals((prev) => {
      const next = { ...prev }
      for (const item of data) {
        if (checked) next[item.id] = item
        else delete next[item.id]
      }
      return next
    })
  }

  async function fetchAllProfessionalsForExport(): Promise<ProfessionalListItem[]> {
    if (!token) return []
    const pageSize = 200
    const all: ProfessionalListItem[] = []
    const seen = new Set<string>()

    for (let page = 1; page <= 100; page++) {
      const res = await listProfessionals(token, {
        page,
        limit: pageSize,
        search: params.q || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
      })
      const items = Array.isArray(res.professionals) ? res.professionals : []
      for (const item of items) {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          all.push(item)
        }
      }
      const totalFromApi = getTotalFromResponse(res)
      if ((totalFromApi != null && all.length >= totalFromApi) || items.length < pageSize) break
    }

    return all
  }

  async function rowsForExport(): Promise<ProfessionalListItem[]> {
    const selected = selectedRows()
    if (selected.length > 0) return selected
    return fetchAllProfessionalsForExport()
  }

  async function handleExportCsv() {
    setIsExporting(true)
    try {
      const rows = await rowsForExport()
      if (rows.length === 0) {
        toast.error('Nenhum dado para exportar')
        return
      }
      exportRowsToCsv('profissionais', PROFESSIONAL_EXPORT_COLUMNS, rows)
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
      const ok = exportRowsToPdf('Profissionais', PROFESSIONAL_EXPORT_COLUMNS, rows)
      if (!ok) toast.error('Nao foi possivel abrir a janela de impressao')
    } finally {
      setIsExporting(false)
    }
  }

  const showEmpty = !isLoading && data.length === 0
  const limit = 10
  const totalPages =
    total == null
      ? params.page + (data.length >= limit ? 1 : 0)
      : Math.max(1, Math.ceil(total / limit))
  const hasPreviousPage = params.page > 1
  const hasNextPage = total == null ? data.length >= limit : params.page < totalPages
  const showPagination = hasPreviousPage || hasNextPage || totalPages > 1
  const selectedCount = selectedRows().length
  const allPageSelected = data.length > 0 && data.every((item) => selectedProfessionals[item.id])
  const somePageSelected = data.some((item) => selectedProfessionals[item.id])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Pesquisar por nome, profissão..." />
        <div className="flex flex-wrap gap-2">
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
            <Button variant="ghost" size="sm" onClick={() => setSelectedProfessionals({})}>
              Limpar selecao ({selectedCount})
            </Button>
          )}
        </div>
      </div>

      {showEmpty ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border/50 bg-muted/20">
          <EmptyState icon={Briefcase} message="Nenhum profissional encontrado." />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl shadow-sm">
          <DataTable>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead className="w-10">
                  <Checkbox
                    aria-label="Selecionar profissionais desta pagina"
                    checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false}
                    onCheckedChange={(checked) => togglePageSelection(checked === true)}
                  />
                </DataTableHead>
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
                  <DataTableCell colSpan={7} className="h-32 text-center">
                    <LoadingSkeleton variant="table-rows" rowCount={3} />
                  </DataTableCell>
                </DataTableRow>
              ) : (
                data.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableCell>
                      <Checkbox
                        aria-label={`Selecionar ${displayName(item)}`}
                        checked={!!selectedProfessionals[item.id]}
                        onCheckedChange={(checked) =>
                          toggleProfessionalSelection(item, checked === true)
                        }
                      />
                    </DataTableCell>
                    <DataTableCell className="font-medium">{displayName(item)}</DataTableCell>
                    <DataTableCell className="capitalize">
                      {typeof item.profissao === 'string' ? item.profissao : '-'}
                    </DataTableCell>
                    <DataTableCell>
                      {typeof item.plano === 'string' ? item.plano : '-'}
                    </DataTableCell>
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

          {!isLoading && showPagination && (
            <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                {total == null
                  ? `Pagina ${params.page} - ${data.length} nesta pagina`
                  : `Pagina ${params.page} de ${totalPages} - ${total} profissional(is)`}
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
