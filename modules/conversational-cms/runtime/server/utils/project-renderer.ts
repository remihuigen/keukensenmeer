import prettier from 'prettier'
import type { ProjectInput } from '~~/shared/types/project'

const PROJECT_FIELD_ORDER: Array<keyof ProjectInput> = [
	'title',
	'publicTitle',
	'status',
	'isFeatured',
	'sortingPriority',
	'styles',
	'description',
	'createdAt',
	'updatedAt',
	'mainImage',
	'images',
	'body',
]

const sanitizeProjectPayload = (project: Record<string, unknown>) => {
	const ordered: Record<string, unknown> = {}

	for (const key of PROJECT_FIELD_ORDER) {
		if (project[key] !== undefined) {
			ordered[key] = project[key]
		}
	}

	for (const [key, value] of Object.entries(project)) {
		if (value === undefined || key === 'slug') continue

		if (!(key in ordered)) {
			ordered[key] = value
		}
	}

	return ordered
}

export const renderProjectFile = async (project: ProjectInput & Record<string, unknown>) => {
	const sanitized = sanitizeProjectPayload(project)

	const payload = JSON.stringify(sanitized, null, 2)

	const content = `
import defineProject from '../../shared/utils/defineProject'

export default defineProject(${payload})
`

	return prettier.format(content, { parser: 'typescript' })
}
