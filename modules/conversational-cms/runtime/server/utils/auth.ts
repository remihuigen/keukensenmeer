import type { H3Event } from 'h3'
import { createError, getRequestHeader } from 'h3'

import { useCmsRuntimeConfig } from './config'

const AUTH_HEADER = 'x-cms-auth'

export const requireCmsAuth = (event: H3Event) => {
	const headerValue = getRequestHeader(event, AUTH_HEADER)
	const expectedToken = useCmsRuntimeConfig().authToken

	if (!expectedToken) {
		throw createError({
			statusCode: 500,
			statusMessage: 'CMS auth token not configured on server',
		})
	}

	if (!headerValue || headerValue !== expectedToken) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Invalid CMS authentication token',
		})
	}
}
