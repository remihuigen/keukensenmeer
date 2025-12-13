/**
 * Removes a related image object from a project
 * * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 * 
 * Body Parameters: DeleteImageSchema
 */

import { schema, db } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'

const deleteImageSchema = z.object({
  pathname: z.string().min(1).describe('The pathname of the image to be removed from the project, as stored in the Cloudflare bucket')
})

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = await getValidatedQuery(event, SlugQuerySchema.parse)
  const body = await readValidatedBody(event, deleteImageSchema.parse)

  try {
    const project = await db
      .select({ id: schema.projects.id })
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

    const result = await db
      .delete(schema.projectImages)
      .where(
        and(
          eq(schema.projectImages.projectId, project.id),
          eq(schema.projectImages.pathname, body.pathname)
        )
      )

    return { success: true, message: `Image "${body.pathname}" has been removed from project "${query.slug}".`, data: result }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to remove image "${body.pathname}" from project "${query.slug}".`,
      data: { error }
    })
  }
})
