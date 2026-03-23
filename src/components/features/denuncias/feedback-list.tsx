'use client'

import { useCallback, useEffect, useState } from 'react'

import { Flag, Mail, Search } from 'lucide-react'
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
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import type { RelatorioListItem } from '@/services/admin-relatorios-fetch'
import { listRelatorios } from '@/services/admin-relatorios-fetch'

import { RespondFeedbackDialog } from './respond-feedback-dialog'

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
  tipo: parseAsString.withDefault(''),
  estado: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
}

export function FeedbackList() {
  const { token } = useAuth()
  const [params, setParams] = useQueryStates(PARAMS)
  const [data, setData] = useState<RelatorioListItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [respondItem, setRespondItem] = useState<RelatorioListItem | null>(null)

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await listRelatorios(token, {
        page: params.page,
        limit: 10,
        search: params.search || undefined,
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
  }, [
    token,
    params.page,
    params.search,
    params.tipo,
    params.estado,
    params.sortBy,
    params.sortOrder,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function hasEmail(item: RelatorioListItem): boolean {
    const email = item.autorEmail ?? (item as { email?: string }).email
    return typeof email === 'string' && email.trim().length > 0
  }

  if (isLoading) {
    return <LoadingSkeleton variant="table-rows" rowCount={5} />
  }

  if (data.length === 0 && !params.search) {
    return <EmptyState icon={Flag} message="Nenhuma denúncia, sugestão ou reclamação encontrada." />
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
          {data.map((item) => (
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
                {typeof item.createdAt === 'string'
                  ? new Date(item.createdAt).toLocaleDateString('pt-PT')
                  : '-'}
              </DataTableCell>
              <DataTableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRespondItem(item)}
                  disabled={!hasEmail(item)}
                  title={
                    !hasEmail(item)
                      ? 'Autor sem email registado. Não é possível responder.'
                      : 'Responder ao autor'
                  }
                >
                  Responder
                </Button>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <RespondFeedbackDialog
        item={respondItem}
        open={!!respondItem}
        onOpenChange={(open) => !open && setRespondItem(null)}
        onSuccess={fetchData}
      />
    </div>
  )
}
