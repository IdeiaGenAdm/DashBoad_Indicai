'use client'

import { useCallback, useEffect, useState } from 'react'

import { Briefcase, Pencil, Search } from 'lucide-react'
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
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import type { ProfessionalListItem } from '@/services/admin-profissionais-fetch'
import { listProfessionals } from '@/services/admin-profissionais-fetch'

import { SubscriptionEditDialog } from './subscription-edit-dialog'

const PARAMS = {
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
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

  const fetchData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await listProfessionals(token, {
        page: params.page,
        limit: 10,
        search: params.search || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
      })
      const items = Array.isArray(res.professionals)
        ? res.professionals
        : ((res as { data?: ProfessionalListItem[] }).data ?? [])
      setData(items)
      setTotal(res.total ?? items.length)
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
  }, [token, params.page, params.search, params.sortBy, params.sortOrder])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function displayName(item: ProfessionalListItem): string {
    return (
      (typeof item.nomeCompleto === 'string' ? item.nomeCompleto : null) ??
      (typeof item.nome === 'string' ? item.nome : null) ??
      '-'
    )
  }

  if (isLoading) {
    return <LoadingSkeleton variant="table-rows" rowCount={5} />
  }

  if (data.length === 0 && !params.search) {
    return <EmptyState icon={Briefcase} message="Nenhum profissional encontrado." />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, profissão..."
            value={params.search}
            onChange={(e) => setParams({ search: e.target.value || null })}
            className="pl-9"
          />
        </div>
      </div>

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
          {data.map((item) => (
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
                  ? new Date(item.expiresAt).toLocaleDateString('pt-PT')
                  : 'Nunca'}
              </DataTableCell>
              <DataTableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => setEditProfessional(item)}>
                  <Pencil className="size-4" />
                  Editar
                </Button>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <SubscriptionEditDialog
        professional={editProfessional}
        open={!!editProfessional}
        onOpenChange={(open) => !open && setEditProfessional(null)}
        onSuccess={fetchData}
      />
    </div>
  )
}
