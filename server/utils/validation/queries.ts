import { z } from 'zod'
import { statusEnum } from '../../db/schema/fields/enums'

export const SlugQuerySchema = z.object({
  slug: z.string().min(1, 'A slug is required for the project').describe('The unique slug for the project'),
})

export const StatusQuerySchema = z.object({
  status: z.enum(statusEnum).optional().describe('The publication status of the project'),
})

export const ConfirmationPasswordSchema = z.object({
  confirmationPassword: z.string().min(1, 'A confirmation password is required. The user should think of their grand child.').describe('The confirmation password to authorize the operation'),
})