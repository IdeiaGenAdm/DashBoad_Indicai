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
import { useAuth } from '@/contexts/auth-context'

const loginSchema = z.object({
  cpf: z
    .string()
    .min(11, 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos')
    .refine((val) => val.replace(/\D/g, '').length === 11 || val.replace(/\D/g, '').length === 14, {
      message: 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido',
    }),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpf: '',
      senha: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    const cpfNormalized = values.cpf.replace(/\D/g, '')
    try {
      await login(cpfNormalized, values.senha)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao fazer login')
    }
  }

  return (
    <Card className="w-full max-w-md border-2 shadow-xl shadow-black/5 dark:shadow-black/20">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-bold">Login Admin</CardTitle>
        <CardDescription className="text-muted-foreground">
          Dashboard IndicAI — Acesso restrito a administradores
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <CardContent className="space-y-5 pt-0">
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
                  <FormLabel>CPF / CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Somente números"
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
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Link
              href="/indicai/recuperar-senha"
              className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="h-11 w-full font-semibold"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
