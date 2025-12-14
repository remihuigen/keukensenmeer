/**
 * Removes one or more related image objects from a project
 * * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 * 
 * Body Parameters: DeleteImageSchema
 */

import { schema, db } from 'hub:db'
import { and, eq, inArray } from 'drizzle-orm'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'
import { validateZodQuerySchema, validateZodBodySchema } from '~~/server/utils/validation'
import { deleteImageSchema } from '~~/server/utils/validation/payloads'
import { invalidateProjectCaches } from '~~/server/utils/invalidateCacheBases'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const { slug } = validateZodQuerySchema(event, SlugQuerySchema)
  const body = await validateZodBodySchema(event, deleteImageSchema)

  // First, get the project ID based on the slug
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
          inArray(schema.projectImages.pathname, body.pathnames)
        )
      )
      .returning()

    const imageCount = result.length
    const message = imageCount === 1
      ? `Image "${body.pathnames[0]}" has been removed from project "${slug}".`
      : `${imageCount} images have been removed from project "${slug}".`

    // Invalidate relevant caches
    await invalidateProjectCaches()

    return createSuccessResponse(result, message)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: `An unexpected error occurred while removing images from project "${slug}".`,
      error
    })
  }
})
