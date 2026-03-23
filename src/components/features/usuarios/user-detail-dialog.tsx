'use client'

import { useCallback, useEffect, useState } from 'react'

import { ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { formatDateDMY } from '@/lib/utils'
import type { UserListItem } from '@/services/admin-users-fetch'
import {
  getUserById,
  removeUserProfilePhoto,
  removeVitrinePhoto,
} from '@/services/admin-users-fetch'

interface VitrinePhoto {
  id: string
  url?: string
  [key: string]: unknown
}

export function UserDetailDialog({
  userId,
  open,
  onOpenChange,
  onSuccess,
}: {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { token } = useAuth()
  const [user, setUser] = useState<UserListItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [removingPhoto, setRemovingPhoto] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<{
    type: 'profile' | 'vitrine'
    photoId?: string
  } | null>(null)

  const fetchUser = useCallback(async () => {
    if (!token || !userId) return
    setIsLoading(true)
    try {
      const res = await getUserById(token, userId)
      setUser(res.user)
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar utilizador')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [token, userId])

  useEffect(() => {
    if (open && userId) fetchUser()
    else setUser(null)
  }, [open, userId, fetchUser])

  async function handleRemovePhoto() {
    if (!confirmRemove || !token || !userId) return
    const key = confirmRemove.type === 'profile' ? 'profile' : (confirmRemove.photoId ?? '')
    setRemovingPhoto(key)
    try {
      if (confirmRemove.type === 'profile') {
        await removeUserProfilePhoto(token, userId)
        toast.success('Foto de perfil removida')
      } else if (confirmRemove.photoId) {
        await removeVitrinePhoto(token, userId, confirmRemove.photoId)
        toast.success('Foto da vitrine removida')
      }
      setConfirmRemove(null)
      fetchUser()
      onSuccess?.()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao remover foto')
    } finally {
      setRemovingPhoto(null)
    }
  }

  const userWithPhotos = user as { vitrinePhotos?: VitrinePhoto[] }
  const vitrinePhotos = Array.isArray(userWithPhotos?.vitrinePhotos)
    ? userWithPhotos.vitrinePhotos
    : []
  const hasProfilePhoto =
    user?.profilePhoto != null || (user as { profilePhotoUrl?: string })?.profilePhotoUrl != null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhe do utilizador</DialogTitle>
          <DialogDescription>Ver informações e gerir fotos do utilizador.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="font-semibold">
                {typeof user.nomeCompleto === 'string'
                  ? user.nomeCompleto
                  : typeof user.nome === 'string'
                    ? user.nome
                    : '-'}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{user.email}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.tipoUsuario && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {user.tipoUsuario}
                  </span>
                )}
                {user.status && (
                  <span
                    className={
                      user.status === 'bloqueado'
                        ? 'rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive'
                        : user.status === 'desativado'
                          ? 'rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
                          : 'rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
                    }
                  >
                    {user.status}
                  </span>
                )}
              </div>
              {user.createdAt && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Registado em {formatDateDMY(user.createdAt)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Foto de perfil</h4>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmRemove({ type: 'profile' })}
                disabled={!hasProfilePhoto}
              >
                <Trash2 className="mr-2 size-4" />
                Remover foto de perfil
              </Button>
              {!hasProfilePhoto && (
                <p className="text-xs text-muted-foreground">Sem foto de perfil</p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Fotos da vitrine</h4>
              {vitrinePhotos.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sem fotos na vitrine</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {vitrinePhotos.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 rounded border p-2">
                      <ImageIcon className="size-4 text-muted-foreground" />
                      <span className="text-xs">#{p.id.slice(0, 6)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => setConfirmRemove({ type: 'vitrine', photoId: p.id })}
                        disabled={removingPhoto === p.id}
                      >
                        {removingPhoto === p.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {confirmRemove && (
          <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm font-medium">
              {confirmRemove.type === 'profile'
                ? 'Remover a foto de perfil deste utilizador?'
                : 'Remover esta foto da vitrine?'}
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmRemove(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={!!removingPhoto}
              >
                {removingPhoto ? <Loader2 className="size-4 animate-spin" /> : 'Remover'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
