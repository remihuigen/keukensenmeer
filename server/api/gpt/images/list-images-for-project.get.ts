/**
 * List all related images for a specific project
 * including their metadata.
 * 
 * Params:
 * - projectSlug: string (required) - The unique identifier for the project
 */

import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'
import { validateZodQuerySchema } from '~~/server/utils/validation'
import { invalidateProjectCaches } from '~~/server/utils/invalidateCacheBases'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const { slug } = validateZodQuerySchema(event, SlugQuerySchema)

  // Fetch project to get its ID
  const { result: project, error } = await safeAsync(async () => {
    return await db
      .select({
        id: schema.projects.id
      })
      .from(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .limit(1)
      .then((results) => results[0] || null)
  })
  if (error) {
    createErrorResponse({
      statusCode: 500,
      message: `An error occurred while retrieving the project with slug "${slug}" from the database.`,
      error
    })
  }
  if (!project) {
    createErrorResponse({
      statusCode: 404,
      message: `Project with slug "${slug}" not found.`,
    })
  }

  try {

    const data = await db.query.projectImages.findMany({
      where: eq(schema.projectImages.projectId, project.id),
    })

    // Invalidate relevant caches
    await invalidateProjectCaches()

    return createSuccessResponse(
      data,
      `Images for project with slug "${slug}" retrieved successfully.`
    )
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: `An unexpected error occurred when retrieving the images for project with slug "${slug}".`,
      error
    })
  }
})
