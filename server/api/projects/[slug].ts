import projects from '~~/data/projects'
import type { ProjectKey } from '~~/data/projects'

export default defineEventHandler(async (event) => {
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
})
