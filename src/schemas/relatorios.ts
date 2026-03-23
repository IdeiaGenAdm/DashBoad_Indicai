import { z } from 'zod'

/** Schema para resposta a denúncia/sugestão/reclamação */
export const respondFeedbackSchema = z.object({
  resposta: z.string().min(10, 'A resposta deve ter pelo menos 10 caracteres'),
})

export type RespondFeedbackFormValues = z.infer<typeof respondFeedbackSchema>
