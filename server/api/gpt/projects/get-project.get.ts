/**
 * Get a specific project by slug
 * 
 * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 * 
 */

import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'
import { validateZodQuerySchema } from '~~/server/utils/validation'
import { getAllProjectSlugs } from '~~/server/utils/getAllProjectSlugs.ts'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = validateZodQuerySchema(event, SlugQuerySchema)

  try {
    const project = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.slug, query.slug))
      .limit(1)
      .then((results) => results[0] || null)

    if (!project) {
      // Help GPT by listing all available slugs
      const slugs = await getAllProjectSlugs()

      createErrorResponse({
        statusCode: 404,
        message: `Project with slug "${query.slug}" not found.`,
        data: {
          availableSlugs: slugs,
        }
      })
    }

    return createSuccessResponse(project, `Project with slug "${query.slug}" retrieved successfully.`)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: 'An unexpected error occurred during database operations. Please try again later.',
      error
    })
  }
})
