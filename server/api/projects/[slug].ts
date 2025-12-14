/**
 * Get project by slug
 */

import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (typeof slug !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ongeldige project slug'
    })
  }

  return await db.query.projects.findFirst({
    columns: {
      title: false, // Strip title field from payload since its for internal use only
    },
    where: eq(schema.projects.slug, slug),
    with: {
      images: true,
    }
  })
}, {
  maxAge: 1000 * 60 * 60 * 24 * 5 * 0,
  staleMaxAge: 1000 * 60 * 60 * 24 * 10 * 0,
  getKey: (slug) => `project:${slug}`
})
