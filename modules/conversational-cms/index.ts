import {
	defineNuxtModule,
	createResolver,
	addTypeTemplate,
	useLogger,
	addServerScanDir,
} from '@nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './runtime/types/options'
import { moduleSetup } from '../../shared/utils/modules'

const MODULE_NAME = '@remihuigen/nuxt-conversational-cms'
const MODULE_KEY = 'conversationalCms'

const DEFAULTS = {
	enabled: true,
	projectsDir: 'data/projects',
	github: {
		owner: 'remihuigen',
		repo: 'keukensenmeer',
		defaultBranch: 'main',
		branchPrefix: 'cms/',
	},
	previewBaseUrl: 'https://preview.keukensenmeer.nl',
} satisfies Partial<ModuleOptions>

const log = useLogger()

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: MODULE_NAME,
		configKey: MODULE_KEY,
		compatibility: {
			nuxt: '^3.0.0 || ^4.0.0',
		},
		defaults: DEFAULTS,
	},
	setup(userOptions, nuxt) {
		const { start, end, isEnabled, options } = moduleSetup<ModuleOptions>(
			MODULE_NAME,
			MODULE_KEY,
			userOptions,
			DEFAULTS,
			log,
		)

		start()

		if (!isEnabled()) return

		// ** Runtime Logic **
		const resolver = createResolver(import.meta.url)
		const runtimeDir = resolver.resolve('./runtime')

		// Transpile the runtime directory
		nuxt.options.build.transpile.push(runtimeDir)

		// Add server directory for auto imports
		addServerScanDir(resolver.resolve(runtimeDir, 'server'))

		// Add types
		addTypeTemplate({
			filename: 'types/cms-config.d.ts',
			src: resolver.resolve(runtimeDir, 'types/config.d.ts'),
		})

		addTypeTemplate({
			filename: 'types/cms.d.ts',
			src: resolver.resolve(runtimeDir, 'types/cms.d.ts'),
		})

		const runtimeConfig = nuxt.options.runtimeConfig
		const githubPrivateKey = process.env.GITHUB_RELEASE_APP_PRIVATE_KEY?.replace(/\\n/g, '\n')

		runtimeConfig.cms = defu(runtimeConfig.cms ?? {}, {
			authToken: process.env.CMS_AUTH_TOKEN,
			projectsDir: options.projectsDir,
			previewBaseUrl: process.env.CMS_PREVIEW_BASE_URL ?? options.previewBaseUrl,
			github: {
				owner: process.env.CMS_GITHUB_REPO_OWNER ?? options.github?.owner,
				repo: process.env.CMS_GITHUB_REPO_NAME ?? options.github?.repo,
				defaultBranch: process.env.CMS_GITHUB_DEFAULT_BRANCH ?? options.github?.defaultBranch,
				branchPrefix: options.github?.branchPrefix,
				app: {
					appId: process.env.GITHUB_RELEASE_APP_ID
						? Number(process.env.GITHUB_RELEASE_APP_ID)
						: undefined,
					clientId: process.env.GITHUB_RELEASE_APP_CLIENT_ID,
					clientSecret: process.env.GITHUB_RELEASE_APP_CLIENT_SECRET,
					privateKey: githubPrivateKey,
				},
			},
			cloudinary: {
				cloudName: process.env.CLOUDINARY_CLOUDNAME,
				apiKey: process.env.CLOUDINARY_API_KEY,
				apiSecret: process.env.CLOUDINARY_API_SECRET,
				uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
			},
			openai: {
				apiKey: process.env.OPENAI_API_KEY,
			},
		})

		runtimeConfig.public = runtimeConfig.public ?? {}
		runtimeConfig.public.cms = defu(runtimeConfig.public.cms ?? {}, {
			previewBaseUrl: runtimeConfig.cms.previewBaseUrl,
		})

		end()
	},
})
