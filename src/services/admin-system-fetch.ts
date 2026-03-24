import { adminFetch } from '@/lib/api'

export interface MaintenanceStatus {
  active?: boolean
  enabled?: boolean
  message?: string
  [key: string]: unknown
}

/** GET /admin/system/maintenance — Estado manutenção */
export async function getMaintenanceMode(authToken: string): Promise<MaintenanceStatus> {
  const res = await adminFetch<MaintenanceStatus>('/system/maintenance', authToken)
  return {
    ...res,
    active:
      typeof res.active === 'boolean'
        ? res.active
        : typeof res.enabled === 'boolean'
          ? res.enabled
          : false,
  }
}

/** POST /admin/system/maintenance — Ativar manutenção */
export async function enableMaintenanceMode(authToken: string): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>('/system/maintenance', authToken, {
    method: 'POST',
  })
}

/** DELETE /admin/system/maintenance — Desativar manutenção */
export async function disableMaintenanceMode(authToken: string): Promise<{ message?: string }> {
  return adminFetch<{ message?: string }>('/system/maintenance', authToken, {
    method: 'DELETE',
  })
}
