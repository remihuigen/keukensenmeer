import { join } from 'node:path'

import slugify from 'slugify'

import projects from '~~/data/projects'

import { useCmsRuntimeConfig } from './config'

const existingSlugs = new Set(Object.keys(projects))

export const slugifyTitle = (title: string) => {
	return slugify(title, {
		lower: true,
		strict: true,
		locale: 'nl',
	})
}

export const ensureUniqueSlug = (title: string) => {
	const baseSlug = slugifyTitle(title)
	let candidate = baseSlug
	let suffix = 2

	while (existingSlugs.has(candidate)) {
		candidate = `${baseSlug}-${suffix}`
		suffix += 1
	}

	existingSlugs.add(candidate)
	return candidate
}

export const getProjectsDirectories = () => {
	const runtimeConfig = useCmsRuntimeConfig()
	const repoRelative = runtimeConfig.projectsDir ?? 'data/projects'
	const absolute = join(process.cwd(), repoRelative)

	return {
		repoRelative,
		absolute,
	}
}

export const getProjectFilePaths = (slug: string) => {
	const dirs = getProjectsDirectories()

	return {
		repoRelative: `${dirs.repoRelative}/${slug}.ts`.replace(/\/+/g, '/'),
		absolute: join(dirs.absolute, `${slug}.ts`),
	}
}
