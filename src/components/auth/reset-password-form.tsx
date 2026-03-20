'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import Link from 'next/link'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { resetPassword } from '@/lib/api'

const resetPasswordSchema = z
  .object({
    cpf: z
      .string()
      .transform((val) => val.replace(/\D/g, ''))
      .refine((val) => val.length === 11, {
        message: 'CPF deve ter 11 dígitos',
      }),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.senha === data.confirmSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmSenha'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      cpf: '',
      senha: '',
      confirmSenha: '',
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null)
    try {
      await resetPassword(token, values.cpf, values.senha, values.confirmSenha)
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao redefinir senha')
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md border-2 shadow-xl shadow-black/5 dark:shadow-black/20">
        <CardHeader>
          <CardTitle>Senha redefinida</CardTitle>
          <CardDescription>
            Sua senha foi alterada com sucesso. Faça login para continuar.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Ir para login</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-2 shadow-xl shadow-black/5 dark:shadow-black/20">
      <CardHeader>
        <CardTitle>Redefinir senha</CardTitle>
        <CardDescription>Informe seu CPF e a nova senha</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Somente números"
                      maxLength={11}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
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
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="h-11 w-full font-semibold" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
