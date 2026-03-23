'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { dateInputToIsoStart, formatDateForInput } from '@/lib/utils'
import { type SubscriptionEditFormValues, subscriptionEditSchema } from '@/schemas/profissionais'
import type { ProfessionalListItem } from '@/services/admin-profissionais-fetch'
import { updateProfessionalSubscription, updateRating } from '@/services/admin-profissionais-fetch'

export function SubscriptionEditDialog({
  professional,
  open,
  onOpenChange,
  onSuccess,
}: {
  professional: ProfessionalListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { token } = useAuth()

  const form = useForm<SubscriptionEditFormValues>({
    resolver: zodResolver(subscriptionEditSchema),
    defaultValues: {
      plano: '',
      estrelas: 0,
      expiresAt: '',
      nuncaExpirar: false,
    },
  })

  const nuncaExpirar = form.watch('nuncaExpirar')

  useEffect(() => {
    if (professional && open) {
      const exp = professional.expiresAt
      const expDate = formatDateForInput(exp)
      form.reset({
        plano: typeof professional.plano === 'string' ? professional.plano : '',
        estrelas: typeof professional.rating === 'number' ? professional.rating : 0,
        expiresAt: expDate,
        nuncaExpirar: !exp || exp === 'null' || exp === '',
      })
    }
  }, [professional, open, form])

  async function onSubmit(values: SubscriptionEditFormValues) {
    if (!token || !professional) return
    try {
      await updateProfessionalSubscription(token, professional.id, {
        plano: values.plano,
        expiresAt: values.nuncaExpirar
          ? undefined
          : dateInputToIsoStart(values.expiresAt || '') || undefined,
        nuncaExpirar: values.nuncaExpirar,
      })
      await updateRating(token, professional.id, { estrelas: values.estrelas })
      toast.success('Plano e classificação atualizados')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar plano e expiração</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="empresarial">Empresarial</SelectItem>
                      <SelectItem value="gratuito">Gratuito</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estrelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classificação (estrelas 0-5)</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} estrela{n !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nuncaExpirar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Nunca expirar</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            {!nuncaExpirar && (
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de expiração</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />A guardar...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
