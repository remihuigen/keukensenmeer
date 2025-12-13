/**
 * Archive a specific project by slug
 * 
 * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 */


import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { validateZodQuerySchema } from '~~/server/utils/validation'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails
  const { slug } = validateZodQuerySchema(event, SlugQuerySchema)

  try {
    const result = await db
      .update(schema.projects)
      .set({ status: 'archived' })
      .where(eq(schema.projects.slug, slug))
      .returning()

    return createSuccessResponse(result, `Project with slug "${slug}" has been archived.`)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: `Failed to archive project with slug "${slug}". Something went wrong during the database operation.`,
      error
    })
  }
})
