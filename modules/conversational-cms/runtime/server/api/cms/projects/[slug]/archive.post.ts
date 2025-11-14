import { createError, getRouterParam } from 'h3'

import { createProjectPullRequest } from '../../../../utils/github'
import { requireCmsAuth } from '../../../../utils/auth'
import { getProjectBySlug, projectToInput } from '../../../../utils/projects'
import { renderProjectFile } from '../../../../utils/project-renderer'
import { getProjectFilePaths } from '../../../../utils/slugify'

export default defineEventHandler(async event => {
	requireCmsAuth(event)

	const slug = getRouterParam(event, 'slug')

	if (!slug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing project slug',
		})
	}

	const project = getProjectBySlug(slug)
	const projectInput = projectToInput(project)

	const updatedAt = new Date().toISOString()
	const normalized = {
		...projectInput,
		status: 'archived' as const,
		updatedAt,
	}

	const projectSource = await renderProjectFile(normalized)
	const { repoRelative } = getProjectFilePaths(slug)

	const commitMessage = `chore(cms): archive project ${slug}`
	const prTitle = `chore(cms): archive ${project.publicTitle}`
	const prBody = `Set **${project.publicTitle}** (${slug}) to archived status via Conversational CMS.`

	const result = await createProjectPullRequest({
		slug,
		title: prTitle,
		body: prBody,
		commitMessage,
		files: [{ path: repoRelative, content: projectSource }],
	})

	return {
		slug,
		status: 'archived',
		updatedAt,
		branch: result.branchName,
		pullRequestUrl: result.pullRequestUrl,
	}
})
