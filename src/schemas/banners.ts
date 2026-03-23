import { z } from 'zod'

/** Schema para criação/edição de banner */
export const bannerSchema = z
  .object({
    titulo: z
      .string()
      .min(2, 'Título deve ter pelo menos 2 caracteres')
      .max(80, 'Título deve ter no máximo 80 caracteres'),
    conteudo: z
      .string()
      .min(5, 'Conteúdo deve ter pelo menos 5 caracteres')
      .max(500, 'Conteúdo deve ter no máximo 500 caracteres'),
    destinatarios: z.string(),
    vigenciaInicio: z.string().optional(),
    vigenciaFim: z.string().optional(),
  })
  .refine(
    (data) => {
      const inicio = data.vigenciaInicio?.trim()
      const fim = data.vigenciaFim?.trim()
      if (!inicio || !fim) return true
      return new Date(inicio) <= new Date(fim)
    },
    { message: 'Data de fim deve ser igual ou posterior à de início', path: ['vigenciaFim'] }
  )

export type BannerFormValues = z.infer<typeof bannerSchema>
