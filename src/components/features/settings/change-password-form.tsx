'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { AdminApiError } from '@/lib/api'
import { type ChangePasswordFormValues, changePasswordSchema } from '@/schemas/auth'
import { changeAdminPassword } from '@/services/admin-auth-fetch'

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const { token, logout } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      senhaAtual: '',
      senhaNova: '',
      confirmSenha: '',
    },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    if (!token) return
    setIsSubmitting(true)
    try {
      await changeAdminPassword(token, {
        senhaAtual: values.senhaAtual,
        senhaNova: values.senhaNova,
      })
      toast.success('Senha alterada com sucesso')
      form.reset()
      onSuccess?.()
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        logout({ message: 'Sessão invalidada. Faça login novamente.' })
        return
      }
      toast.error(e instanceof Error ? e.message : 'Erro ao alterar senha')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="senhaAtual"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha atual</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senhaNova"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nova senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Alterando...
            </>
          ) : (
            'Alterar senha'
          )}
        </Button>
      </form>
    </Form>
  )
}
