/**
 * Deletes a project and all associated data by slug.
 * Requires a confirmation password to authorize the deletion.
 * 
 * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 */


import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { validateZodQuerySchema } from '~~/server/utils/validation'
import { SlugQuerySchema, ConfirmationPasswordSchema } from '~~/server/utils/validation/queries'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails
  const { slug, confirmationPassword } = validateZodQuerySchema(event, SlugQuerySchema.extend(ConfirmationPasswordSchema.shape))

  const config = useRuntimeConfig()
  if (confirmationPassword !== config.confirmationPassword) {
    return createErrorResponse({
      statusCode: 403,
      message: 'Invalid confirmation password. Project deletion is not authorized.',
      data: {
        hint: 'The confirmation password should be the one that makes the user think of their grand child.'
      }
    })
  }

  try {
    const result = await db
      .delete(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .returning()

    return createSuccessResponse(result, `Project with slug "${slug}" has been deleted.`)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: `Failed to delete project with slug "${slug}". Something went wrong during the database operation.`,
      error
    })
  }
})
