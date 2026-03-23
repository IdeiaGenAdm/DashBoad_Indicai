import { z } from 'zod'

/** Schema para alteração de plano e expiração do profissional */
export const subscriptionEditSchema = z
  .object({
    plano: z.string().min(1, 'Selecione ou insira o plano'),
    estrelas: z.number().min(0).max(5),
    expiresAt: z.string().optional(),
    nuncaExpirar: z.boolean(),
  })
  .refine(
    (data) =>
      data.nuncaExpirar ||
      (typeof data.expiresAt === 'string' && data.expiresAt.trim().length > 0),
    {
    message: 'Defina data de expiração ou marque "Nunca expirar"',
    path: ['expiresAt'],
  })

export type SubscriptionEditFormValues = z.infer<typeof subscriptionEditSchema>
