import { z } from 'zod'

const cpfSchema = z
  .string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 11, {
    message: 'CPF deve ter 11 dígitos',
  })

const cnpjSchema = z
  .string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 14, {
    message: 'CNPJ deve ter 14 dígitos',
  })

/** Schema base para criar profissional ou cliente (POST /admin/users) */
export const createUserSchema = z
  .object({
    tipoUsuario: z.enum(['profissional', 'cliente'], {
      error: 'Selecione o tipo de conta',
    }),
    nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    cpf: cpfSchema,
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmSenha: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.senha === data.confirmSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmSenha'],
  })

export type CreateUserFormValues = z.infer<typeof createUserSchema>

/** Schema para criar empresa (POST /admin/empresas) */
export const createEmpresaSchema = z
  .object({
    nomeCompleto: z.string().min(2, 'Nome/Razão social deve ter pelo menos 2 caracteres'),
    cnpj: cnpjSchema,
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmSenha: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.senha === data.confirmSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmSenha'],
  })

export type CreateEmpresaFormValues = z.infer<typeof createEmpresaSchema>
