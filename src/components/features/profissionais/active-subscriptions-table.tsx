'use client'

import { useEffect, useState } from 'react'

import { CreditCard } from 'lucide-react'
import { parseAsString, useQueryStates } from 'nuqs'
import { toast } from 'sonner'

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { SearchInput } from '@/components/ui/search-input'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { formatDateDMY } from '@/lib/utils'
import {
  type ActiveSubscriptionItem,
  listActiveSubscriptions,
} from '@/services/admin-profissionais-fetch'

const PARAMS = {
  q: parseAsString.withDefault(''),
}

function formatPlanLabel(v?: string | null): string {
  if (!v) return '-'
  const labels: Record<string, string> = {
    gratuito: 'Gratuito',
    basico: 'Básico',
    pro: 'Pro',
    master: 'Master',
    vip: 'VIP',
  }
  return labels[v.toLowerCase()] ?? v
}

function formatCurrency(v?: string | number | null): string {
  if (v == null || v === '') return '-'
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ActiveSubscriptionsTable() {
  const { token } = useAuth()
  const [params] = useQueryStates(PARAMS)
  const [items, setItems] = useState<ActiveSubscriptionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    listActiveSubscriptions(token, { limit: 20, offset: 0 })
      .then((res) => {
        const unique = new Map<string, ActiveSubscriptionItem>()
        for (const sub of res.assinaturas) {
          const key = sub.profissionalId || sub.id
          if (!key || unique.has(key)) continue
          unique.set(key, sub)
        }
        setItems(Array.from(unique.values()))
      })
      .catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) {
          setItems([])
          return
        }
        toast.error(e instanceof Error ? e.message : 'Erro ao carregar assinaturas ativas')
        setItems([])
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const query = params.q.trim().toLowerCase()
  const filteredItems = query
    ? items.filter((sub) => {
        const fields = [sub.nomeCompleto, sub.nivelPatrocinio, sub.status]
        return fields.some((value) => (value ?? '').toLowerCase().includes(query))
      })
    : items

  const showEmpty = !isLoading && filteredItems.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Pesquisar por profissional, plano ou status..." />
      </div>

      {showEmpty ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border/50 bg-muted/20">
          <EmptyState icon={CreditCard} message="Nenhuma assinatura ativa encontrada." />
        </div>
      ) : (
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Profissional</DataTableHead>
              <DataTableHead>Plano</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead>Próxima cobrança</DataTableHead>
              <DataTableHead className="text-right">Valor</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {isLoading ? (
              <DataTableRow>
                <DataTableCell colSpan={5} className="h-32 text-center">
                  <LoadingSkeleton variant="table-rows" rowCount={4} />
                </DataTableCell>
              </DataTableRow>
            ) : (
              filteredItems.map((sub) => (
                <DataTableRow key={sub.id}>
                  <DataTableCell className="font-medium">{sub.nomeCompleto || '-'}</DataTableCell>
                  <DataTableCell>{formatPlanLabel(sub.nivelPatrocinio)}</DataTableCell>
                  <DataTableCell className="capitalize">{sub.status || '-'}</DataTableCell>
                  <DataTableCell>
                    {sub.nextChargeAt ? formatDateDMY(sub.nextChargeAt) : 'Sem data'}
                  </DataTableCell>
                  <DataTableCell className="text-right">{formatCurrency(sub.valor)}</DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      )}
    </div>
  )
}
