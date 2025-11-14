import { createError } from 'h3'
import projects from '~~/data/projects'
import type { Project, ProjectInput, Style } from '~~/shared/types/project'

type ProjectWithExtras = Project & Record<string, unknown>

const PROJECTS = projects as Record<string, ProjectWithExtras>

export const getAllProjects = () => Object.values(PROJECTS)

export const getProjectSlugs = () => Object.keys(PROJECTS)

export const getProjectBySlug = (slug: string) => {
	const project = PROJECTS[slug]

	if (!project) {
		throw createError({
			statusCode: 404,
			statusMessage: `Project "${slug}" not found`,
		})
	}

	return project
}

export const getProjectStyles = () =>
	Array.from(new Set(getAllProjects().flatMap(project => project.styles))).sort() as Style[]

export const projectToInput = (project: ProjectWithExtras) => {
	const { slug: _ignored, ...rest } = project
	return rest as ProjectInput & Record<string, unknown>
}
