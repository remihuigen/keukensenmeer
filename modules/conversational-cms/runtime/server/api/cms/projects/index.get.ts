import type { Project } from '~~/shared/types/project'

import { requireCmsAuth } from '../../../utils/auth'
import { getAllProjects } from '../../../utils/projects'

type ProjectListItem = Pick<
	Project,
	'title' | 'publicTitle' | 'status' | 'updatedAt' | 'styles' | 'sortingPriority' | 'isFeatured' | 'mainImage'
> & { slug: string }

export default defineEventHandler(event => {
	requireCmsAuth(event)

	const projects = getAllProjects()

	const items = projects.map(project => ({
		slug: project.slug,
		title: project.title,
		publicTitle: project.publicTitle,
		status: project.status,
		updatedAt: project.updatedAt,
		styles: project.styles,
		sortingPriority: project.sortingPriority,
		isFeatured: project.isFeatured,
		mainImage: project.mainImage,
	})) satisfies ProjectListItem[]

	return {
		projects: items,
		total: items.length,
	}
})
