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

  const { slug } = validateZodQuerySchema(event, SlugQuerySchema)
  const body = await validateZodBodySchema(event, deleteImageSchema)

  const { result: project, error: projectError } = await safeAsync(async () => {
    return await db
      .select({
        id: schema.projects.id
      })
      .from(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .limit(1)
      .then((results) => results[0] || null)
  })

  if (projectError) {
    createErrorResponse({
      statusCode: 500,
      message: 'An error occurred while retrieving the project from the database.',
      error: projectError
    })
  }

  if (!project) {
    createErrorResponse({
      statusCode: 404,
      message: `Project with slug "${slug}" not found.`,
    })
  }

  try {
    const result = await db
      .delete(schema.projectImages)
      .where(
        and(
          eq(schema.projectImages.projectId, project.id),
          eq(schema.projectImages.pathname, body.pathname)
        )
      )
      .returning()

    return createSuccessResponse(result, `Image "${body.pathname}" has been removed from project "${slug}".`)
  } catch (error) {
    createErrorResponse({
      statusCode: 400,
      message: `An unexpected error occurred while removing image "${body.pathname}" from project "${slug}".`,
      error
    })
  }
})
