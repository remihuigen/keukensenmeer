/**
 * List all projects
 * 
 * Params:
 * - status (string, optional): Filter projects by status ('published' | 'draft' | 'archived')
 */

import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { StatusQuerySchema } from '~~/server/utils/validation/queries'
import { validateZodQuerySchema } from '~~/server/utils/validation'
import { invalidateProjectCaches } from '~~/server/utils/invalidateCacheBases'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = validateZodQuerySchema(event, StatusQuerySchema)
  try {
    // Invalidate relevant caches
    await invalidateProjectCaches()
    const data = await db.query.projects.findMany({
      where: query.status ? eq(schema.projects.status, query.status) : undefined,
      with: {
        images: true,
      }
    })

    return createSuccessResponse(
      data,
      'Projects retrieved successfully.'
    )
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: 'An unexpected error occurred while retrieving projects. Please try again later.',
      error
    })
  }
})
