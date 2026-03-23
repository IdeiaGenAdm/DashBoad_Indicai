'use client'

import { useEffect } from 'react'
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
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { cn, dateInputToIsoEnd, dateInputToIsoStart, formatDateForInput } from '@/lib/utils'
import { type BannerFormValues, bannerSchema } from '@/schemas/banners'
import type { BannerApi } from '@/services/admin-banners-fetch'
import { createBanner, updateBanner } from '@/services/admin-banners-fetch'

function destinatariosToAudienceType(v: string): 'all' | 'users' | 'segment' {
  if (v === 'todos') return 'all'
  return 'users'
}

function audienceTypeToDestinatarios(t: BannerApi['audienceType']): string {
  if (t === 'all') return 'todos'
  if (t === 'users') return 'profissionais'
  return 'todos'
}

const DESTINATARIOS_OPTIONS = [
  { value: 'todos', label: 'Todos os utilizadores' },
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

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      titulo: '',
      conteudo: '',
      destinatarios: 'todos',
      vigenciaInicio: '',
      vigenciaFim: '',
    },
  })

  const titulo = form.watch('titulo')
  const conteudo = form.watch('conteudo')

  useEffect(() => {
    if (banner && open) {
      form.reset({
        titulo: banner.title ?? '',
        conteudo: banner.body ?? '',
        destinatarios: audienceTypeToDestinatarios(banner.audienceType),
        vigenciaInicio: formatDateForInput(banner.startsAt) || '',
        vigenciaFim: formatDateForInput(banner.endsAt) || '',
      })
    } else if (!banner && open) {
      form.reset({
        titulo: '',
        conteudo: '',
        destinatarios: 'todos',
        vigenciaInicio: '',
        vigenciaFim: '',
      })
    }
  }, [banner, open, form])

  async function onSubmit(values: BannerFormValues) {
    if (!token) return
    try {
      const payload = {
        title: values.titulo,
        body: values.conteudo,
        audienceType: destinatariosToAudienceType(values.destinatarios || 'todos'),
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
