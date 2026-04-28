'use client'

import { useEffect, useState } from 'react'

import { Briefcase } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { type TopProfessionItem, getTopProfessions } from '@/services/admin-metrics-fetch'

import { DateRangeFilter } from './date-range-filter'

export function TopProfessionsCard() {
  const { token } = useAuth()
  const [items, setItems] = useState<TopProfessionItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (!token) return
    getTopProfessions(token, { startDate: startDate || undefined, endDate: endDate || undefined })
      .then((res) => {
        const list = res.professions ?? res.data ?? []
        setItems(Array.isArray(list) ? list : [])
      })
      .catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) {
          setItems([])
          return
        }
        toast.error(e instanceof Error ? e.message : 'Erro ao carregar profissões')
        setItems(null)
      })
      .finally(() => setIsLoading(false))
  }, [token, startDate, endDate])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="size-5" />
            Profissões mais buscadas
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
            <Briefcase className="size-5" />
            Profissões mais buscadas
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
          <EmptyState icon={Briefcase} message="Nenhuma profissão encontrada ou sem dados." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="size-5" />
          Profissões mais buscadas
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
              key={i}
              className="flex items-center justify-between rounded-lg bg-muted/40 p-3 dark:bg-muted/20"
            >
              <span className="font-medium capitalize">
                {typeof item.profissao === 'string'
                  ? item.profissao
                  : typeof item.nome === 'string'
                    ? item.nome
                    : 'N/A'}
              </span>
              <span className="text-sm text-muted-foreground">
                {item.total ?? item.count ?? 0} busca{(item.total ?? item.count) !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
