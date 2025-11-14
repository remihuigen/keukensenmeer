import { createError, getRouterParam } from 'h3'

import { createProjectPullRequest } from '../../../../utils/github'
import { requireCmsAuth } from '../../../../utils/auth'
import { getProjectBySlug, projectToInput } from '../../../../utils/projects'
import { renderProjectFile } from '../../../../utils/project-renderer'
import { ProjectInputSchema } from '../../../../utils/project-schema'
import { getProjectFilePaths } from '../../../../utils/slugify'
import { readValidatedBody } from '../../../../utils/validation'

export default defineEventHandler(async event => {
	requireCmsAuth(event)

	const slug = getRouterParam(event, 'slug')

	if (!slug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing project slug in request path',
		})
	}

	const existingProject = getProjectBySlug(slug)
	const existingInput = projectToInput(existingProject)

	const payload = await readValidatedBody(event, ProjectInputSchema)
	const updatedAt = new Date().toISOString()

	const normalizedProject = {
		...existingInput,
		...payload,
		createdAt: payload.createdAt ?? existingInput.createdAt,
		updatedAt,
	} as typeof existingInput

	const projectSource = await renderProjectFile(normalizedProject)
	const { repoRelative } = getProjectFilePaths(slug)

	const commitMessage = `chore(cms): update project ${slug}`
	const prTitle = `chore(cms): update ${existingProject.publicTitle}`
	const prBody = `Automated Conversational CMS update for **${existingProject.publicTitle}** (${slug}).`

	const result = await createProjectPullRequest({
		slug,
		title: prTitle,
		body: prBody,
		commitMessage,
		files: [
			{
				path: repoRelative,
				content: projectSource,
			},
		],
	})

	return {
		slug,
		updatedAt,
		branch: result.branchName,
		pullRequestUrl: result.pullRequestUrl,
	}
})
