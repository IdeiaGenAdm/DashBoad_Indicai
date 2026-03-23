'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import {
  type RespondFeedbackFormValues,
  respondFeedbackSchema,
} from '@/schemas/relatorios'
import type { RelatorioListItem } from '@/services/admin-relatorios-fetch'
import { respondReportFeedback } from '@/services/admin-relatorios-fetch'

export function RespondFeedbackDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: {
  item: RelatorioListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { token } = useAuth()

  const form = useForm<RespondFeedbackFormValues>({
    resolver: zodResolver(respondFeedbackSchema),
    defaultValues: { resposta: '' },
  })

  useEffect(() => {
    if (open) form.reset({ resposta: '' })
  }, [open, form])

  const hasEmail =
    item &&
    typeof (item.autorEmail ?? (item as { email?: string }).email) === 'string' &&
    ((item.autorEmail ?? (item as { email?: string }).email) as string).trim().length > 0

  async function onSubmit(values: RespondFeedbackFormValues) {
    if (!token || !item) return
    if (!hasEmail) {
      toast.error('Não é possível responder: autor sem email registado.')
      return
    }
    const tipo = typeof item.tipo === 'string' ? item.tipo : 'denuncia'
    try {
      await respondReportFeedback(token, tipo, item.id, {
        resposta: values.resposta,
      })
      toast.success('Resposta enviada ao autor por email')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar resposta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Responder ao autor</DialogTitle>
        </DialogHeader>
        {item && !hasEmail && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="size-5 shrink-0" />
            <p>
              Este autor não tem email registado. Não é possível enviar resposta
              por email. Contacte o utilizador por outro canal.
            </p>
          </div>
        )}
        {item && hasEmail && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="resposta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resposta (será enviada por email)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Escreva a sua resposta ao autor..."
                        rows={5}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  'Enviar resposta'
                )}
              </Button>
            </form>
          </Form>
        )}
        {!item && (
          <p className="text-sm text-muted-foreground">
            Selecione um item para responder.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
