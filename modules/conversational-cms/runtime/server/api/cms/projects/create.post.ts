import { createProjectPullRequest } from '../../../utils/github'
import { renderProjectIndexFile } from '../../../utils/project-index'
import { renderProjectFile } from '../../../utils/project-renderer'
import { ProjectInputSchema } from '../../../utils/project-schema'
import { getProjectSlugs } from '../../../utils/projects'
import {
	getProjectsDirectories,
	getProjectFilePaths,
	ensureUniqueSlug,
} from '../../../utils/slugify'
import { requireCmsAuth } from '../../../utils/auth'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async event => {
	requireCmsAuth(event)

	const payload = await readValidatedBody(event, ProjectInputSchema)
	const slug = ensureUniqueSlug(payload.title)

	const createdAt = payload.createdAt ?? new Date().toISOString()
	const updatedAt = createdAt

	const normalizedProject = {
		...payload,
		status: payload.status ?? 'draft',
		createdAt,
		updatedAt,
	} as typeof payload

	const projectSource = await renderProjectFile(normalizedProject)
	const { repoRelative } = getProjectFilePaths(slug)
	const { repoRelative: projectsDir } = getProjectsDirectories()

	const currentSlugs = getProjectSlugs()
	const indexSource = renderProjectIndexFile([...currentSlugs, slug])

	const commitMessage = `feat(cms): add project ${slug}`
	const prTitle = `feat(cms): add ${payload.publicTitle ?? payload.title}`
	const prBody = `Conversational CMS request to add **${payload.publicTitle ?? payload.title}** (${slug}).`

	const result = await createProjectPullRequest({
		slug,
		title: prTitle,
		body: prBody,
		commitMessage,
		files: [
			{ path: repoRelative, content: projectSource },
			{ path: `${projectsDir}/index.ts`.replace(/\/+/g, '/'), content: indexSource },
		],
	})

	return {
		slug,
		branch: result.branchName,
		pullRequestUrl: result.pullRequestUrl,
	}
})
