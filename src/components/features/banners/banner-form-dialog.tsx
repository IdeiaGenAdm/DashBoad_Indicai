'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Loader2, Megaphone, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { cn, dateInputToIsoEnd, dateInputToIsoStart, formatDateForInput } from '@/lib/utils'
import { type BannerFormValues, bannerSchema } from '@/schemas/banners'
import type { BannerApi } from '@/services/admin-banners-fetch'
import { createBanner, updateBanner } from '@/services/admin-banners-fetch'
import { listUsers } from '@/services/admin-users-fetch'

function destinatariosToAudienceType(v: string): 'all' | 'users' | 'segment' {
  if (v === 'todos') return 'all'
  if (v === 'usuarios_especificos') return 'segment'
  return 'users'
}

function audienceTypeToDestinatarios(t: BannerApi['audienceType']): string {
  if (t === 'all') return 'todos'
  if (t === 'segment') return 'usuarios_especificos'
  return 'profissionais'
}

const DESTINATARIOS_OPTIONS = [
  { value: 'todos', label: 'Todos os utilizadores' },
  { value: 'usuarios_especificos', label: 'Utilizadores específicos' },
  { value: 'profissionais', label: 'Profissionais' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'empresas', label: 'Empresas' },
] as const

export function BannerFormDialog({
  banner,
  open,
  onOpenChange,
  onSuccess,
}: {
  banner?: BannerApi | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { token } = useAuth()
  const isEdit = !!banner?.id
  const [userOptions, setUserOptions] = useState<Array<{ id: string; nome: string; email?: string }>>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersSearch, setUsersSearch] = useState('')

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      titulo: '',
      conteudo: '',
      destinatarios: 'todos',
      destinatariosEspecificos: [],
      vigenciaInicio: '',
      vigenciaFim: '',
    },
  })

  const titulo = form.watch('titulo')
  const conteudo = form.watch('conteudo')
  const destinatarios = form.watch('destinatarios')
  const selectedUserIds = form.watch('destinatariosEspecificos') ?? []
  const filteredUserOptions = useMemo(() => {
    const term = usersSearch.trim().toLowerCase()
    if (!term) return userOptions
    return userOptions.filter(
      (u) => u.nome.toLowerCase().includes(term) || (u.email ?? '').toLowerCase().includes(term)
    )
  }, [userOptions, usersSearch])

  useEffect(() => {
    if (banner && open) {
      form.reset({
        titulo: banner.title ?? '',
        conteudo: banner.body ?? '',
        destinatarios: audienceTypeToDestinatarios(banner.audienceType),
        destinatariosEspecificos: banner.audienceType === 'segment' ? (banner.audienceUserIds ?? []) : [],
        vigenciaInicio: formatDateForInput(banner.startsAt) || '',
        vigenciaFim: formatDateForInput(banner.endsAt) || '',
      })
    } else if (!banner && open) {
      form.reset({
        titulo: '',
        conteudo: '',
        destinatarios: 'todos',
        destinatariosEspecificos: [],
        vigenciaInicio: '',
        vigenciaFim: '',
      })
    }
  }, [banner, open, form])

  useEffect(() => {
    if (!open || !token || destinatarios !== 'usuarios_especificos') return
    let cancelled = false
    const loadUsers = async () => {
      try {
        setUsersLoading(true)
        const res = await listUsers(token, { page: 1, limit: 200, status: 'ativo' })
        if (cancelled) return
        const options = (res.users ?? [])
          .filter((u) => typeof u.id === 'string' && u.id.length > 0)
          .map((u) => ({
            id: String(u.id),
            nome: u.nomeCompleto?.trim() || u.nome?.trim() || 'Utilizador sem nome',
            email: u.email?.trim() || undefined,
          }))
        setUserOptions(options)
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Erro ao carregar utilizadores')
        }
      } finally {
        if (!cancelled) setUsersLoading(false)
      }
    }
    loadUsers()
    return () => {
      cancelled = true
    }
  }, [open, token, destinatarios])

  async function onSubmit(values: BannerFormValues) {
    if (!token) return
    try {
      const payload = {
        title: values.titulo,
        body: values.conteudo,
        audienceType: destinatariosToAudienceType(values.destinatarios || 'todos'),
        audienceUserIds:
          values.destinatarios === 'usuarios_especificos'
            ? (values.destinatariosEspecificos ?? [])
            : null,
        startsAt: dateInputToIsoStart(values.vigenciaInicio ?? '') ?? null,
        endsAt: dateInputToIsoEnd(values.vigenciaFim ?? '') ?? null,
        active: true,
      }
      if (isEdit && banner) {
        await updateBanner(token, banner.id, payload)
        toast.success('Banner atualizado')
      } else {
        await createBanner(token, payload)
        toast.success('Banner criado')
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao guardar banner')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            {isEdit ? 'Editar banner' : 'Criar banner'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex.: Manutenção agendada"
                        maxLength={80}
                        className="font-medium"
                      />
                    </FormControl>
                    <div className="flex items-center justify-between gap-2">
                      <FormMessage />
                      <span
                        className={cn(
                          'text-[10px] text-muted-foreground tabular-nums',
                          (field.value?.length ?? 0) >= 75 && 'text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {field.value?.length ?? 0}/80
                      </span>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conteudo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Mensagem principal que será exibida aos utilizadores..."
                        rows={4}
                        maxLength={500}
                        className="resize-none"
                      />
                    </FormControl>
                    <div className="flex items-center justify-between gap-2">
                      <FormMessage />
                      <span
                        className={cn(
                          'text-[10px] text-muted-foreground tabular-nums',
                          (field.value?.length ?? 0) >= 450 && 'text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {field.value?.length ?? 0}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="destinatarios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="size-4" />
                      Destinatários
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Quem verá este banner?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DESTINATARIOS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Escolha o perfil de utilizadores que verá este banner
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {destinatarios === 'usuarios_especificos' && (
                <FormField
                  control={form.control}
                  name="destinatariosEspecificos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecionar utilizadores</FormLabel>
                      <FormControl>
                        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                          <Input
                            value={usersSearch}
                            onChange={(e) => setUsersSearch(e.target.value)}
                            placeholder="Pesquisar por nome ou e-mail..."
                          />
                          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                            {usersLoading ? (
                              <p className="text-xs text-muted-foreground">A carregar utilizadores...</p>
                            ) : filteredUserOptions.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Nenhum utilizador encontrado para seleção.
                              </p>
                            ) : (
                              filteredUserOptions.map((user) => {
                                const checked = (field.value ?? []).includes(user.id)
                                return (
                                  <label
                                    key={user.id}
                                    className="flex cursor-pointer items-start gap-2 rounded-md border border-border/60 bg-background px-2 py-1.5"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(state) => {
                                        const current = field.value ?? []
                                        const next =
                                          state === true
                                            ? [...current, user.id]
                                            : current.filter((id) => id !== user.id)
                                        field.onChange(next)
                                      }}
                                    />
                                    <span className="min-w-0 text-xs">
                                      <span className="block truncate font-medium">{user.nome}</span>
                                      {user.email && (
                                        <span className="block truncate text-muted-foreground">
                                          {user.email}
                                        </span>
                                      )}
                                    </span>
                                  </label>
                                )
                              })
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedUserIds.length} utilizador(es) selecionado(s).
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="size-4" />
                Vigência
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vigenciaInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-normal text-muted-foreground">
                        Início
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vigenciaFim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-normal text-muted-foreground">
                        Fim
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Opcional. Sem datas = visível a partir de agora até ser desativado manualmente
              </p>
            </div>

            {/* Preview */}
            {(titulo || conteudo) && (
              <>
                <Separator className="bg-border/50" />
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Megaphone className="size-3.5 text-muted-foreground" />
                    <Label className="text-xs font-medium text-muted-foreground">
                      Pré-visualização
                    </Label>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-sm dark:from-primary/15 dark:via-primary/8">
                    <div className="absolute top-0 right-0 size-24 rounded-full bg-primary/10 blur-2xl" />
                    <div className="relative space-y-2.5">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                          <Megaphone className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <h4 className="text-base leading-tight font-bold text-foreground">
                            {titulo || 'Título do banner'}
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {conteudo || 'Conteúdo do banner será exibido aqui.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />A guardar...
                  </>
                ) : isEdit ? (
                  'Atualizar'
                ) : (
                  'Criar banner'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
