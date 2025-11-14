import projects from '~~/data/projects'
import type { ProjectKey } from '~~/data/projects'

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (typeof slug !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ongeldige project slug'
    })
  }

  const project = projects[slug as ProjectKey];

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project niet gevonden'
    })
  }

  return project
}, {
  maxAge: 1000 * 60 * 60 * 24 * 5,
  staleMaxAge: 1000 * 60 * 60 * 24 * 10,
  getKey: (slug) => `project:${slug}`
})
