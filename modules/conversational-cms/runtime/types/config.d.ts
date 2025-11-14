import type { ConversationalCmsRuntimeConfig, ConversationalCmsPublicConfig } from './cms'

declare module 'nuxt/schema' {
	interface RuntimeConfig {
		cms: ConversationalCmsRuntimeConfig
	}
	interface PublicRuntimeConfig {
		cms: ConversationalCmsPublicConfig
	}
}

export {}
