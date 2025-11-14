export interface GithubAppConfig {
	appId?: number
	clientId?: string
	clientSecret?: string
	privateKey?: string
	installationId?: number
}

export interface GithubRepositoryConfig {
	owner?: string
	repo?: string
	defaultBranch?: string
	branchPrefix?: string
	app?: GithubAppConfig
}

export interface CloudinaryConfig {
	cloudName?: string
	apiKey?: string
	apiSecret?: string
	uploadPreset?: string
}

export interface ConversationalCmsRuntimeConfig {
	authToken?: string
	projectsDir?: string
	github: GithubRepositoryConfig
	cloudinary: CloudinaryConfig
	openai?: {
		apiKey?: string
	}
	previewBaseUrl?: string
}

export interface ConversationalCmsPublicConfig {
	previewBaseUrl?: string
}
