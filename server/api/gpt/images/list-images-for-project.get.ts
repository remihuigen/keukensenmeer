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

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = await getValidatedQuery(event, SlugQuerySchema.parse)

  try {
    const project = await db
      .select({
        id: schema.projects.id
      })
      .from(schema.projects)
      .where(eq(schema.projects.slug, query.slug))
      .limit(1)
      .then((results) => results[0] || null)

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: `Project with slug "${query.slug}" not found.`,
      })
    }

    return await db
      .select()
      .from(schema.projectImages)
      .where(eq(schema.projectImages.projectId, project.id))
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to list images for project with slug "${query.slug}".`,
      data: { error }
    })
  }
})
