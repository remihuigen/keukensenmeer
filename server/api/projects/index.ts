import projects from '~~/data/projects'
import type { ProjectOverviewItem } from '~~/shared/types/project'

export default defineCachedEventHandler(async (_event) => {
  return Object.values(projects).map(project => ({
    publicTitle: project.publicTitle,
    slug: project.slug,
    mainImage: project.mainImage,
    description: project.description,
    styles: project.styles,
  })) satisfies ProjectOverviewItem[]
}, {
  maxAge: 1000 * 60 * 60 * 24,
  staleMaxAge: 1000 * 60 * 60 * 24 * 7,
  getKey: () => 'projects_index'
})
