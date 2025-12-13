/**
 * Update a specific project by slug
 * 
 * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 * 
 */
import { SlugQuerySchema } from '~~/server/utils/validation/queries'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const _query = await getValidatedQuery(event, SlugQuerySchema.parse)
  return 'Hello Nitro'
})
