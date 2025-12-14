import { schema, db } from 'hub:db'

/**
 * Get all project slugs from the database
 * @returns an array of project slugs
 */
export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const results = await db
      .select({ slug: schema.projects.slug })
      .from(schema.projects)

    return results.map((r) => r.slug)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: 'An unexpected error occurred during database operations. Please try again later.',
      error
    })
  }
} 