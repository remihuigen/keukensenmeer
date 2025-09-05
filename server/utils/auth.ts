import type { H3Event } from 'h3'

export const authenticateRequest = (event: H3Event) => {
  const bearer = getRequestHeader(event, 'Authorization')
  const token = bearer?.split(' ')[1]

  if (!token || token !== useRuntimeConfig().apiToken) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }
}
