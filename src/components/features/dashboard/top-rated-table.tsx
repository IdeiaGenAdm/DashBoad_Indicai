'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Star, User } from 'lucide-react'
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

  const displayName = (item: TopRatedProfessionalItem) => item.nomeCompleto ?? item.nome ?? 'N/A'

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-5" />
            Profissionais melhor avaliados
          </CardTitle>
          <CardDescription>Profissionais com melhor rating e mais avaliações</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton variant="cards" rowCount={5} />
        </CardContent>
      </Card>
    )
  }

  if (!items || items.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-5" />
            Profissionais melhor avaliados
          </CardTitle>
          <CardDescription>Profissionais com melhor rating e mais avaliações</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState icon={User} message="Nenhum profissional encontrado ou sem avaliações." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-5" />
            Profissionais melhor avaliados
          </CardTitle>
          <CardDescription>Profissionais com melhor rating e mais avaliações</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/relatorios">Ver relatórios</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Nome</DataTableHead>
              <DataTableHead>Profissão</DataTableHead>
              <DataTableHead>Avaliação</DataTableHead>
              <DataTableHead>Nº avaliações</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {items.map((item, i) => (
              <DataTableRow key={item.id ?? i}>
                <DataTableCell className="font-medium">{displayName(item)}</DataTableCell>
                <DataTableCell className="capitalize">{item.profissao ?? '—'}</DataTableCell>
                <DataTableCell>
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-4 fill-primary text-primary" />
                    {typeof item.rating === 'number' ? item.rating.toFixed(1) : '—'}
                  </span>
                </DataTableCell>
                <DataTableCell>{item.avaliacoes ?? '—'}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </CardContent>
    </Card>
  )
}
