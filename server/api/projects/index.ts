/**
 * List all projects with their main image.
 */

import { schema, db } from 'hub:db'
import { eq, desc } from 'drizzle-orm'

export default defineCachedEventHandler(async (_event) => {
  try {
    return {
      data: await db.query.projects.findMany({
        where: eq(schema.projects.status, 'published'),
        with: {
          images: {
            where: eq(schema.projectImages.isMainImage, true)
          }
        },
        orderBy: [desc(schema.projects.sortingPriority)],
      })
    }
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: 'An unexpected error occurred while retrieving projects. Please try again later.',
      error
    })
  }
}, {
  maxAge: 1000 * 60 * 60 * 24, // 1 day
  group: 'api',
  name: 'projects',
  getKey: () => 'projects_index'
})
