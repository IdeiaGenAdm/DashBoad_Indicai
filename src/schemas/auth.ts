import { z } from 'zod'

/** Schema para login (CPF/CNPJ + senha) */
export const loginSchema = z.object({
  cpf: z
    .string()
    .min(11, 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos')
    .refine((val) => val.replace(/\D/g, '').length === 11 || val.replace(/\D/g, '').length === 14, {
      message: 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido',
    }),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

/** Schema para recuperar senha (esqueci minha senha) */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

/** Schema para redefinir senha (com token) */
export const resetPasswordSchema = z
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

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

/** Schema para alteração de senha do admin (senha atual + nova senha) */
export const changePasswordSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
    senhaNova: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
    confirmSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.senhaNova === data.confirmSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmSenha'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
