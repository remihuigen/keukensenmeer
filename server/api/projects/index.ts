import projects from '~~/data/projects'
import type { ProjectOverviewItem } from '~~/shared/types/project'

export default defineEventHandler(async (_event) => {
  return Object.values(projects).map(project => ({
    title: project.title,
    slug: project.slug
  })) satisfies ProjectOverviewItem[]
})
