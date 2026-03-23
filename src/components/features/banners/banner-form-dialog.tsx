'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { type BannerFormValues, bannerSchema } from '@/schemas/banners'
import type { BannerListItem } from '@/services/admin-banners-fetch'
import { createBanner, updateBanner } from '@/services/admin-banners-fetch'

export function BannerFormDialog({
  banner,
  open,
  onOpenChange,
  onSuccess,
}: {
  banner?: BannerListItem | null
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

  useEffect(() => {
    if (banner && open) {
      form.reset({
        titulo: typeof banner.titulo === 'string' ? banner.titulo : '',
        conteudo: typeof banner.conteudo === 'string' ? banner.conteudo : '',
        destinatarios: typeof banner.destinatarios === 'string' ? banner.destinatarios : 'todos',
        vigenciaInicio:
          typeof banner.vigenciaInicio === 'string' ? banner.vigenciaInicio.slice(0, 10) : '',
        vigenciaFim: typeof banner.vigenciaFim === 'string' ? banner.vigenciaFim.slice(0, 10) : '',
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
      if (isEdit && banner) {
        await updateBanner(token, banner.id, {
          titulo: values.titulo,
          conteudo: values.conteudo,
          destinatarios: values.destinatarios || 'todos',
          vigenciaInicio: values.vigenciaInicio || undefined,
          vigenciaFim: values.vigenciaFim || undefined,
        })
        toast.success('Banner atualizado')
      } else {
        await createBanner(token, {
          titulo: values.titulo,
          conteudo: values.conteudo,
          destinatarios: values.destinatarios || 'todos',
          vigenciaInicio: values.vigenciaInicio || undefined,
          vigenciaFim: values.vigenciaFim || undefined,
        })
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar banner' : 'Criar banner'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Título do banner" />
                  </FormControl>
                  <FormMessage />
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
                    <Textarea {...field} placeholder="Conteúdo do banner" rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destinatarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinatários</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todos">Todos os utilizadores</SelectItem>
                      <SelectItem value="profissionais">Profissionais</SelectItem>
                      <SelectItem value="clientes">Clientes</SelectItem>
                      <SelectItem value="empresas">Empresas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vigenciaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início vigência</FormLabel>
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
                    <FormLabel>Fim vigência</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />A guardar...
                </>
              ) : isEdit ? (
                'Atualizar'
              ) : (
                'Criar'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
