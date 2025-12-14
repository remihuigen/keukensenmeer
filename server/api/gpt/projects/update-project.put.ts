/**
 * Update a specific project by slug
 * 
 * Query Parameters:
 * - slug: string (required) - The unique identifier for the project
 * 
 * Body Parameters: ProjectUpdateSchema
 */
import { SlugQuerySchema } from '~~/server/utils/validation/queries'
import { validateZodQuerySchema, validateZodBodySchema } from '~~/server/utils/validation'
import { projectUpdateSchema } from '~~/server/utils/validation/payloads'
import { getAllProjectSlugs } from '~~/server/utils/getAllProjectSlugs'
import { slugify } from '~~/server/utils/slugify'
import { invalidateProjectCaches } from '~~/server/utils/invalidateCacheBases'

import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'
import type { Style } from '~~/server/db/schema/fields/enums'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const { slug } = validateZodQuerySchema(event, SlugQuerySchema)
  const payload = await validateZodBodySchema(event, projectUpdateSchema)


  // Generate new slug if publicTitle is updated
  const newSlug = payload.publicTitle ? slugify(payload.publicTitle) : null
  const styles: Style[] = []

  // Handle styles additions/removals
  if (payload.styles && Array.isArray(payload.styles)) {
    styles.push(...payload.styles)
  } else if (payload.styles) {
    const { add, remove } = payload.styles

    if (!add?.length && !remove?.length) {
      createErrorResponse({
        statusCode: 400,
        message: 'At least one of "add" or "remove" arrays must be provided and contain at least one style.',
        data: { receivedStyles: payload.styles }
      })
    }

    // Fetch current styles from the database
    const { result: project, error } = await safeAsync(async () => {
      return await db
        .select({ styles: schema.projects.styles })
        .from(schema.projects)
        .where(eq(schema.projects.slug, slug))
        .limit(1)
        .then((results) => results[0] || null)
    })

    if (error) {
      createErrorResponse({
        statusCode: 500,
        message: 'An error occurred while retrieving the project from the database.',
        error
      })
    }

    if (!project) {
      const slugs = await getAllProjectSlugs()
      createErrorResponse({
        statusCode: 404,
        message: `Project with slug "${slug}" not found.`,
        data: { availableSlugs: slugs }
      })
    }



    // Create a new unique set of the current styles
    /** Because of  @see https://github.com/nuxt-hub/core/issues/710 well use an assertion for now */
    const currentStyles = new Set(project.styles as Style[])

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
      .returning()

    // Invalidate relevant caches
    await invalidateProjectCaches()

    return createSuccessResponse(result, `Project with slug "${slug}" has been updated.`)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: `An unexpected error occurred while updating the project with slug "${slug}".`,
      error
    })
  }
})
