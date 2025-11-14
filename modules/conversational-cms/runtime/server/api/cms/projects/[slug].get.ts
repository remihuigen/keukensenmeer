import { createError, getRouterParam } from 'h3'

import type { Project } from '~~/shared/types/project'

import { requireCmsAuth } from '../../../utils/auth'
import { getProjectBySlug } from '../../../utils/projects'

export default defineEventHandler(event => {
	requireCmsAuth(event)

	const slug = getRouterParam(event, 'slug')

	if (!slug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing project slug',
		})
	}

	const project = getProjectBySlug(slug) as Project & Record<string, unknown>

	return {
		project,
	}
})
