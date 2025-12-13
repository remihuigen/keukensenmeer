/**
 * Update a specific project by slug
 * 
 * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 * 
 * Body Parameters: ProjectUpdateSchema
 */
import { SlugQuerySchema } from '~~/server/utils/validation/queries'
import { projectUpdateSchema } from '~~/server/utils/validation/payloads'
import { slugify } from '~~/server/utils/slugify'
import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = await getValidatedQuery(event, SlugQuerySchema.parse)
  const payload = await readValidatedBody(event, projectUpdateSchema.parse)

  const { slug } = query
  // Generate new slug if publicTitle is updated
  const newSlug = payload.publicTitle ? slugify(payload.publicTitle) : null
  const styles: typeof schema.styleEnum = []

  // Handle styles additions/removals
  if (payload.styles && Array.isArray(payload.styles)) {
    styles.push(...payload.styles)
  } else if (payload.styles) {
    const { add, remove } = payload.styles

    if (!add?.length && !remove?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one of "add" or "remove" arrays must be provided and contain at least one style.',
      })
    }

    // Fetch current styles from the database
    const project = await db
      .select({ styles: schema.projects.styles })
      .from(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .limit(1)
      .then((results) => results[0] || null)

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: `Project with slug "${slug}" not found.`,
      })
    }

    // Create a new unique set of the current styles
    /** Because of  @see https://github.com/nuxt-hub/core/issues/710 well use an assertion for now */
    const currentStyles = new Set(project.styles as string[])

    // Add new styles
    if (Array.isArray(add)) {
      add.forEach((style) => currentStyles.add(style))
    }

    // Remove styles
    if (Array.isArray(remove)) {
      remove.forEach((style) => currentStyles.delete(style))
    }

    // Convert back to array
    styles.push(...Array.from(currentStyles))
  }

  const resolvedPayload: Partial<typeof schema.projects.$inferInsert> = {
    ...payload,
  }

  // Handle slug update
  if (newSlug) {
    resolvedPayload.slug = newSlug
  }

  // Handle styles update
  if (styles.length > 0) {
    resolvedPayload.styles = styles
  }

  try {
    const result = await db
      .update(schema.projects)
      .set(resolvedPayload)
      .where(eq(schema.projects.slug, slug))

    return { success: true, message: `Project with slug "${slug}" has been updated.`, data: result }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to update project with slug "${slug}".`,
      data: { error }
    })
  }
})
