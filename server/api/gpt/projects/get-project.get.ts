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

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = await getValidatedQuery(event, SlugQuerySchema.parse)

  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.slug, query.slug))
    .limit(1)
    .then((results) => results[0] || null)

  if (!project) {
    // Help GPT by listing all available slugs
    const slugs = await db
      .select({ slug: schema.projects.slug })
      .from(schema.projects)
      .then((results) => results.map((r) => r.slug))

    throw createError({
      statusCode: 404,
      statusMessage: `Project with slug "${query.slug}" not found.`,
      data: {
        availableSlugs: slugs,
      }
    })
  }

  return project
})
