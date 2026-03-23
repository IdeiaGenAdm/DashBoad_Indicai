'use client'

import { useEffect, useState } from 'react'

import { ArrowRight, Star, User } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import type { TopRatedProfessionalItem } from '@/services/admin-metrics-fetch'
import { getTopRatedProfessionals } from '@/services/admin-metrics-fetch'

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
      {initials || '?'}
    </div>
  )
}

function StarRating({ rating }: { rating?: number }) {
  if (typeof rating !== 'number') return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      <Star className="size-3 fill-primary text-primary" />
      {rating.toFixed(1)}
    </span>
  )
}

export function TopRatedTable() {
  const { token } = useAuth()
  const [items, setItems] = useState<TopRatedProfessionalItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    getTopRatedProfessionals(token)
      .then((res) => {
        const list = res.professionals ?? res.data ?? []
        setItems(Array.isArray(list) ? list : [])
      })
      .catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) {
          setItems([])
          return
        }
        toast.error(e instanceof Error ? e.message : 'Erro ao carregar profissionais')
        setItems(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const displayName = (item: TopRatedProfessionalItem) =>
    item.nomeCompleto ?? item.nome ?? 'N/A'

  const header = (
    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Star className="size-4 text-primary" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">Melhor avaliados</CardTitle>
          <CardDescription className="text-xs">Top profissionais da plataforma</CardDescription>
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild className="gap-1 text-xs text-muted-foreground hover:text-primary">
        <Link href="/dashboard/relatorios">
          Ver relatórios
          <ArrowRight className="size-3" />
        </Link>
      </Button>
    </CardHeader>
  )

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        {header}
        <CardContent>
          <LoadingSkeleton variant="table-rows" rowCount={5} />
        </CardContent>
      </Card>
    )
  }

  if (!items || items.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        {header}
        <CardContent>
          <EmptyState icon={User} message="Nenhum profissional com avaliações." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      {header}
      <CardContent className="p-0">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Nome</DataTableHead>
              <DataTableHead className="hidden sm:table-cell">Profissão</DataTableHead>
              <DataTableHead>Rating</DataTableHead>
              <DataTableHead className="hidden md:table-cell">Avaliações</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {items.map((item, i) => (
              <DataTableRow key={item.id ?? i}>
                <DataTableCell>
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={displayName(item)} />
                    <span className="truncate text-sm font-medium max-w-[120px]">
                      {displayName(item)}
                    </span>
                  </div>
                </DataTableCell>
                <DataTableCell className="hidden sm:table-cell text-xs text-muted-foreground capitalize">
                  {item.profissao ?? '—'}
                </DataTableCell>
                <DataTableCell>
                  <StarRating rating={item.rating} />
                </DataTableCell>
                <DataTableCell className="hidden md:table-cell text-sm">
                  {item.avaliacoes ?? '—'}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </CardContent>
    </Card>
  )
}
