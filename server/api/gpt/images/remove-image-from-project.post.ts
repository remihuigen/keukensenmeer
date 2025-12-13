/**
 * Removes a related image object from a project
 * * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 * 
 * Body Parameters: DeleteImageSchema
 */

import { schema, db } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'
import { validateZodQuerySchema, validateZodBodySchema } from '~~/server/utils/validation'
import { deleteImageSchema } from '~~/server/utils/validation/payloads'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = validateZodQuerySchema(event, SlugQuerySchema)
  const body = await validateZodBodySchema(event, deleteImageSchema)

  try {
    const project = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.slug, query.slug))
      .limit(1)
      .then((results) => results[0] || null)

    if (!project) {
      createErrorResponse({
        statusCode: 404,
        message: `Project with slug "${query.slug}" not found.`,
      })
    }

    const result = await db
      .delete(schema.projectImages)
      .where(
        and(
          eq(schema.projectImages.projectId, project.id),
          eq(schema.projectImages.pathname, body.pathname)
        )
      )
      .returning()

    return createSuccessResponse(result, `Image "${body.pathname}" has been removed from project "${query.slug}".`)
  } catch (error) {
    createErrorResponse({
      statusCode: 400,
      message: `An unexpected error occurred while removing image "${body.pathname}" from project "${query.slug}".`,
      error
    })
  }
})
