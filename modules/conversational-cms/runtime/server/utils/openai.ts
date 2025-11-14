import { createError } from 'h3'

import { useCmsRuntimeConfig } from './config'

export const fetchOpenAiFile = async (fileId: string) => {
	const apiKey = useCmsRuntimeConfig().openai?.apiKey

	if (!apiKey) {
		throw createError({
			statusCode: 500,
			statusMessage: 'OpenAI API key missing for CMS image upload',
		})
	}

	const response = await fetch(`https://api.openai.com/v1/files/${fileId}/content`, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	})

	if (!response.ok) {
		throw createError({
			statusCode: 502,
			statusMessage: `Unable to download image bytes from OpenAI (${response.status})`,
		})
	}

	const arrayBuffer = await response.arrayBuffer()
	return Buffer.from(arrayBuffer)
}
