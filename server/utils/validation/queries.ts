import { z } from 'zod'

export const SlugQuerySchema = z.object({
  slug: z.string().min(1, 'A slug is required for the project').describe('The unique slug for the project'),
})

export const StatusQuerySchema = z.object({
  status: z.enum(schema.statusEnum).optional().describe('The publication status of the project'),
})