import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { Octokit } from 'octokit'
import { createAppAuth } from '@octokit/auth-app'
import { useCmsRuntimeConfig } from './config'

type GitFileChange = {
	path: string
	content: string
}

export interface PullRequestResult {
	branchName: string
	pullRequestUrl: string
	pullRequestNumber: number
}

interface RepositoryConnection {
	octokit: Octokit
	owner: string
	repo: string
	defaultBranch: string
	branchPrefix: string
}

let cachedInstallationId: number | null = null
let cachedOctokit: Octokit | null = null

const ensureGithubConfig = () => {
	const config = useCmsRuntimeConfig()
	const github = config.github

	if (!github?.owner || !github.repo || !github.defaultBranch) {
		throw createError({
			statusCode: 500,
			statusMessage: 'GitHub repository configuration missing for Conversational CMS',
		})
	}

	if (!github.app?.appId || !github.app.privateKey) {
		throw createError({
			statusCode: 500,
			statusMessage: 'GitHub App credentials missing for Conversational CMS',
		})
	}

	return github
}

const getOctokitConnection = async (): Promise<RepositoryConnection> => {
	const github = ensureGithubConfig()

	if (cachedOctokit) {
		return {
			octokit: cachedOctokit,
			owner: github.owner!,
			repo: github.repo!,
			defaultBranch: github.defaultBranch!,
			branchPrefix: github.branchPrefix ?? 'cms/',
		}
	}

	const authOptions = {
		appId: github.app!.appId!,
		privateKey: github.app!.privateKey!,
		clientId: github.app?.clientId,
		clientSecret: github.app?.clientSecret,
	}

	const appOctokit = new Octokit({
		authStrategy: createAppAuth,
		auth: authOptions,
	})

	if (!cachedInstallationId) {
		const installation = await appOctokit.rest.apps.getRepoInstallation({
			owner: github.owner!,
			repo: github.repo!,
		})

		cachedInstallationId = installation.data.id
	}

	cachedOctokit = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			...authOptions,
			installationId: cachedInstallationId!,
		},
	})

	return {
		octokit: cachedOctokit,
		owner: github.owner!,
		repo: github.repo!,
		defaultBranch: github.defaultBranch!,
		branchPrefix: github.branchPrefix ?? 'cms/',
	}
}

const ensureTrailingNewline = (content: string) => (content.endsWith('\n') ? content : `${content}\n`)

const createBranchName = (slug: string, prefix: string) => {
	const safeSlug = slug.replace(/[^a-z0-9-]+/gi, '-')
	return `${prefix}${safeSlug}/${randomUUID()}`
}

interface PullRequestPayload {
	slug: string
	title: string
	body?: string
	commitMessage: string
	files: GitFileChange[]
}

export const createProjectPullRequest = async (payload: PullRequestPayload): Promise<PullRequestResult> => {
	if (!payload.files?.length) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Cannot create pull request without file changes',
		})
	}

	const { octokit, owner, repo, defaultBranch, branchPrefix } = await getOctokitConnection()

	const baseRef = await octokit.rest.git.getRef({
		owner,
		repo,
		ref: `heads/${defaultBranch}`,
	})

	const baseCommitSha = baseRef.data.object.sha
	const { data: baseCommit } = await octokit.rest.git.getCommit({
		owner,
		repo,
		commit_sha: baseCommitSha,
	})

	const tree = await octokit.rest.git.createTree({
		owner,
		repo,
		base_tree: baseCommit.tree.sha,
		tree: payload.files.map(file => ({
			path: file.path,
			mode: '100644',
			type: 'blob',
			content: ensureTrailingNewline(file.content),
		})),
	})

	const commit = await octokit.rest.git.createCommit({
		owner,
		repo,
		message: payload.commitMessage,
		tree: tree.data.sha,
		parents: [baseCommitSha],
	})

	const branchName = createBranchName(payload.slug, branchPrefix)

	await octokit.rest.git.createRef({
		owner,
		repo,
		ref: `refs/heads/${branchName}`,
		sha: commit.data.sha,
	})

	const previewUrl = useCmsRuntimeConfig().previewBaseUrl ?? 'https://preview.keukensenmeer.nl'

	const pull = await octokit.rest.pulls.create({
		owner,
		repo,
		head: branchName,
		base: defaultBranch,
		title: payload.title,
		body:
			payload.body ??
			`Automated Conversational CMS update for **${payload.slug}**. Preview build will be available at ${previewUrl}.`,
	})

	return {
		branchName,
		pullRequestUrl: pull.data.html_url,
		pullRequestNumber: pull.data.number,
	}
}
