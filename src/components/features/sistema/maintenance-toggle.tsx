'use client'

import { useCallback, useEffect, useState } from 'react'

import { Loader2, Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import {
  disableMaintenanceMode,
  enableMaintenanceMode,
  getMaintenanceMode,
} from '@/services/admin-system-fetch'

export function MaintenanceToggle() {
  const { token, user } = useAuth()
  const [active, setActive] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [confirmEnableOpen, setConfirmEnableOpen] = useState(false)

  const isMaster = user?.role === 'master'

  const fetchStatus = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await getMaintenanceMode(token)
      setActive(!!res.active)
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        setActive(false)
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar estado')
      setActive(null)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  async function handleToggle(confirmEnable = false) {
    if (!token || !isMaster) return
    if (!active && !confirmEnable) {
      setConfirmEnableOpen(true)
      return
    }
    setIsToggling(true)
    try {
      if (active) {
        await disableMaintenanceMode(token)
        setActive(false)
        toast.success('Manutenção desativada')
      } else {
        await enableMaintenanceMode(token)
        setActive(true)
        toast.success('Modo manutenção ativado. Apenas admins mantêm acesso.')
      }
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Apenas master pode alterar o modo manutenção.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao alterar')
    } finally {
      setIsToggling(false)
    }
  }

  if (!isMaster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-5" />
            Modo manutenção
          </CardTitle>
          <CardDescription>
            Apenas utilizadores com permissão master podem ativar ou desativar o modo manutenção.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Loader2 className="size-5 animate-spin" />
            Modo manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {active ? (
            <ShieldOff className="size-5 text-destructive" />
          ) : (
            <Shield className="size-5" />
          )}
          Modo manutenção
        </CardTitle>
        <CardDescription>
          {active
            ? 'O site está em manutenção. Apenas admins podem aceder.'
            : 'Ativar manutenção bloqueia o acesso de utilizadores normais.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={active ? 'default' : 'destructive'}
          onClick={() => handleToggle()}
          disabled={isToggling}
        >
          {isToggling ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />A processar...
            </>
          ) : active ? (
            'Desativar manutenção'
          ) : (
            'Ativar manutenção'
          )}
        </Button>
      </CardContent>

      <Dialog open={confirmEnableOpen} onOpenChange={setConfirmEnableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ativação do modo manutenção</DialogTitle>
            <DialogDescription>
              Ao ativar o modo manutenção, utilizadores comuns deixam de aceder ao aplicativo.
              Apenas administradores com permissão continuam com acesso ao painel para gestão e
              suporte.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
            Impacto: login e navegação dos utilizadores serão bloqueados temporariamente até a
            manutenção ser desativada.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmEnableOpen(false)}
              disabled={isToggling}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setConfirmEnableOpen(false)
                await handleToggle(true)
              }}
              disabled={isToggling}
            >
              Confirmar ativação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
