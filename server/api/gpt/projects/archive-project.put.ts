/**
 * Archive a specific project by slug
 * 
 * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 */


import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails
  const query = await getValidatedQuery(event, SlugQuerySchema.parse)

  try {
    const result = await db
      .update(schema.projects)
      .set({ status: 'archived' })
      .where(eq(schema.projects.slug, query.slug))

    return { success: true, message: `Project with slug "${query.slug}" has been archived.`, data: result }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to archive project with slug "${query.slug}".`,
      data: { error }
    })
  }
})
