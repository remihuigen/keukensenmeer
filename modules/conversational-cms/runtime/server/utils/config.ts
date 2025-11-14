import { createError } from 'h3'

import type { ConversationalCmsRuntimeConfig } from '../../types/cms'

export const useCmsRuntimeConfig = (): ConversationalCmsRuntimeConfig => {
	const config = useRuntimeConfig()

	if (!config?.cms) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Conversational CMS runtime config missing',
		})
	}

	return config.cms as ConversationalCmsRuntimeConfig
}

export const useCmsConfig = useCmsRuntimeConfig
