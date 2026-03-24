'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { type LoginFormValues, loginSchema } from '@/schemas/auth'

export function LoginForm() {
  const searchParams = useSearchParams()
  const redirectMessage = searchParams.get('message')
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
    <Card className="flex h-full w-full flex-col border-0 shadow-sm lg:min-h-0">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-xl font-semibold">Login Admin</CardTitle>
        <CardDescription>Insira os seus dados para aceder ao painel</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {redirectMessage && (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                {redirectMessage}
              </p>
            )}
            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Link
                href="/indicme/recuperar-senha"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
