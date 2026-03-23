'use client'

import { useCallback, useEffect, useState } from 'react'

import { Eye, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react'
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
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { formatDateDMY } from '@/lib/utils'
import type { BannerApi } from '@/services/admin-banners-fetch'
import { deleteBanner, labelAudienceType, listBanners } from '@/services/admin-banners-fetch'

import { BannerFormDialog } from './banner-form-dialog'

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
}

export function BannersList() {
  const { token } = useAuth()
  const [params, setParams] = useQueryStates(PARAMS)
  const [data, setData] = useState<BannerApi[]>([])
  const [, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [detailBanner, setDetailBanner] = useState<BannerApi | null>(null)
  const [editBanner, setEditBanner] = useState<BannerApi | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<BannerApi | null>(null)

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await listBanners(token, {
        page: params.page,
        limit: 10,
        search: params.q || undefined,
      })
      const items = Array.isArray(res.banners)
        ? res.banners
        : ((res as { data?: BannerApi[] }).data ?? [])
      setData(items)
      setTotal(res.total ?? items.length)
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar banners')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [token, params.page, params.q])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (params.q && params.page !== 1) {
      setParams({ page: 1 })
    }
  }, [params.q, params.page, setParams])

  async function handleDelete() {
    if (!confirmDelete || !token) return
    try {
      await deleteBanner(token, confirmDelete.id)
      toast.success('Banner eliminado')
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

  const showEmpty = !isLoading && data.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Pesquisar..." />
        <Button onClick={() => setCreateOpen(true)}>Criar banner</Button>
      </div>

      {showEmpty ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border/50 bg-muted/20">
          <EmptyState
            icon={ImageIcon}
            message="Nenhum banner encontrado."
            action={{
              label: 'Criar banner',
              onClick: () => setCreateOpen(true),
            }}
          />
        </div>
      ) : (
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Título</DataTableHead>
              <DataTableHead>Destinatários</DataTableHead>
              <DataTableHead>Vigência</DataTableHead>
              <DataTableHead className="text-right">Ações</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {isLoading ? (
              <DataTableRow>
                <DataTableCell colSpan={4} className="h-32 text-center">
                  <LoadingSkeleton variant="table-rows" rowCount={3} />
                </DataTableCell>
              </DataTableRow>
            ) : (
              data.map((item) => (
                <DataTableRow key={item.id}>
                  <DataTableCell className="font-medium">{item.title || '-'}</DataTableCell>
                  <DataTableCell>{labelAudienceType(item.audienceType)}</DataTableCell>
                  <DataTableCell className="text-sm text-muted-foreground">
                    {item.startsAt || item.endsAt
                      ? `${formatDateDMY(item.startsAt) || '—'} a ${formatDateDMY(item.endsAt) || '—'}`
                      : 'Sem limite'}
                  </DataTableCell>
                  <DataTableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailBanner(item)}
                        title="Ver detalhes"
                        className="h-8 px-2.5"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditBanner(item)}
                        title="Editar"
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

      <Dialog open={!!detailBanner} onOpenChange={(o) => !o && setDetailBanner(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="size-5 text-primary" />
              Detalhe do banner
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {detailBanner && (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-sm dark:from-primary/15 dark:via-primary/8">
                <div className="absolute top-0 right-0 size-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <ImageIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h4 className="text-base leading-tight font-bold text-foreground">
                        {detailBanner.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {detailBanner.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 rounded-lg bg-muted/30 p-3 text-xs dark:bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Destinatários</span>
                  <span className="font-medium">
                    {labelAudienceType(detailBanner.audienceType)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vigência</span>
                  <span className="font-medium">
                    {detailBanner.startsAt || detailBanner.endsAt
                      ? `${formatDateDMY(detailBanner.startsAt) || '—'} a ${formatDateDMY(detailBanner.endsAt) || '—'}`
                      : 'Sem limite'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <BannerFormDialog
        banner={editBanner}
        open={!!editBanner}
        onOpenChange={(open) => !open && setEditBanner(null)}
        onSuccess={() => {
          setEditBanner(null)
          fetchData()
        }}
      />
      <BannerFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          setCreateOpen(false)
          fetchData()
        }}
      />

      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar banner</DialogTitle>
            <DialogDescription>
              {`Eliminar o banner "${confirmDelete?.title ?? ''}"? Esta ação não pode ser revertida.`}
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
