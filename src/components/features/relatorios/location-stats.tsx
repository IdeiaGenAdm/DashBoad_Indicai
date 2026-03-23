'use client'

import { useEffect, useState } from 'react'

import { MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import {
  type DemandByRegionItem,
  type UsersByCityItem,
  getDemandByRegion,
  getUsersByCity,
} from '@/services/admin-metrics-fetch'

export function LocationStats() {
  const { token } = useAuth()
  const [cities, setCities] = useState<UsersByCityItem[] | null>(null)
  const [regions, setRegions] = useState<DemandByRegionItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([
      getUsersByCity(token).catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) return { cities: [] }
        throw e
      }),
      getDemandByRegion(token).catch((e) => {
        if (e instanceof AdminApiError && e.status === 403) return { regions: [] }
        throw e
      }),
    ])
      .then(([cityRes, regionRes]) => {
        const cityList =
          (cityRes as { cities?: UsersByCityItem[] }).cities ??
          (cityRes as { data?: UsersByCityItem[] }).data ??
          []
        setCities(Array.isArray(cityList) ? cityList : [])
        const regionList =
          (regionRes as { regions?: DemandByRegionItem[] }).regions ??
          (regionRes as { data?: DemandByRegionItem[] }).data ??
          []
        setRegions(Array.isArray(regionList) ? regionList : [])
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'Erro ao carregar localização')
        setCities(null)
        setRegions(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  function displayLocation(name: string | undefined): string {
    if (!name || name.trim() === '') return 'Desconhecido'
    return name
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-5" />
            Localização e demanda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton variant="cards" rowCount={4} />
        </CardContent>
      </Card>
    )
  }

  const hasCities = cities && cities.length > 0
  const hasRegions = regions && regions.length > 0

  if (!hasCities && !hasRegions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-5" />
            Localização e demanda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={MapPin} message="Sem dados de localização ou demanda." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-5" />
          Localização e demanda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasCities && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Utilizadores por cidade</h4>
            <div className="space-y-2 rounded-md border">
              {cities.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b p-3 last:border-b-0"
                >
                  <span>{displayLocation(item.cidade ?? item.regiao)}</span>
                  <span className="font-medium">{item.total ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasRegions && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Demanda por região</h4>
            <div className="space-y-2 rounded-md border">
              {regions.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b p-3 last:border-b-0"
                >
                  <span>{displayLocation(item.regiao)}</span>
                  <span className="font-medium">{item.total ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
