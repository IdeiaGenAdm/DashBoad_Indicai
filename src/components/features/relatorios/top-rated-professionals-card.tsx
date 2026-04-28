'use client'

import { useEffect, useState } from 'react'

import { Star, User } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import {
  type TopRatedProfessionalItem,
  getTopRatedProfessionals,
} from '@/services/admin-metrics-fetch'

import { DateRangeFilter } from './date-range-filter'

export function TopRatedProfessionalsCard() {
  const { token } = useAuth()
  const [items, setItems] = useState<TopRatedProfessionalItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (!token) return
    getTopRatedProfessionals(token, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
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
  }, [token, startDate, endDate])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-5" />
            Profissionais melhor avaliados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
          <LoadingSkeleton variant="cards" rowCount={5} />
        </CardContent>
      </Card>
    )
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-5" />
            Profissionais melhor avaliados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
          <EmptyState icon={User} message="Nenhum profissional encontrado ou sem avaliações." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="size-5" />
          Profissionais melhor avaliados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={item.id ?? i}
              className="flex items-center justify-between rounded-lg bg-muted/40 p-3 dark:bg-muted/20"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">
                  {typeof item.nomeCompleto === 'string'
                    ? item.nomeCompleto
                    : typeof item.nome === 'string'
                      ? item.nome
                      : 'N/A'}
                </div>
                {typeof item.profissao === 'string' && (
                  <div className="text-sm text-muted-foreground capitalize">{item.profissao}</div>
                )}
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                <span className="font-medium">
                  {typeof item.rating === 'number' ? item.rating.toFixed(1) : '-'}
                </span>
                {typeof item.avaliacoes === 'number' && (
                  <span className="text-xs text-muted-foreground">({item.avaliacoes})</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
