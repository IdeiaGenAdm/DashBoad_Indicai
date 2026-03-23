'use client'

import { useCallback, useEffect, useState } from 'react'

import { Image as ImageIcon, Eye, Pencil, Search, Trash2 } from 'lucide-react'
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
import { formatDateDMY } from '@/lib/utils'
import type { BannerApi } from '@/services/admin-banners-fetch'
import { deleteBanner, labelAudienceType, listBanners } from '@/services/admin-banners-fetch'

import { BannerFormDialog } from './banner-form-dialog'

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
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
  }, [token, params.page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  if (isLoading) {
    return <LoadingSkeleton variant="table-rows" rowCount={5} />
  }

  if (data.length === 0 && !params.search) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={ImageIcon}
          message="Nenhum banner encontrado."
          action={{
            label: 'Criar banner',
            onClick: () => setCreateOpen(true),
          }}
        />
        <BannerFormDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={fetchData} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={params.search}
            onChange={(e) => setParams({ search: e.target.value || null })}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>Criar banner</Button>
      </div>

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
          {data.map((item) => (
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
          ))}
        </DataTableBody>
      </DataTable>

      <Dialog open={!!detailBanner} onOpenChange={(o) => !o && setDetailBanner(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailBanner?.title ?? 'Detalhe do banner'}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {detailBanner && (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Conteúdo:</span> {detailBanner.body ?? '-'}</p>
              <p><span className="font-medium">Destinatários:</span> {labelAudienceType(detailBanner.audienceType)}</p>
              <p><span className="font-medium">Vigência:</span> {detailBanner.startsAt || detailBanner.endsAt ? `${formatDateDMY(detailBanner.startsAt) || '—'} a ${formatDateDMY(detailBanner.endsAt) || '—'}` : 'Sem limite'}</p>
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
