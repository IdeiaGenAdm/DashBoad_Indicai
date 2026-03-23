import { z } from 'zod'

/** Schema para criação/edição de banner */
export const bannerSchema = z.object({
  titulo: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  conteudo: z.string().min(5, 'Conteúdo deve ter pelo menos 5 caracteres'),
  destinatarios: z.string(),
  vigenciaInicio: z.string().optional(),
  vigenciaFim: z.string().optional(),
})

export type BannerFormValues = z.infer<typeof bannerSchema>
