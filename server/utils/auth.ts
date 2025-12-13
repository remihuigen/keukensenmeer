import type { H3Event } from 'h3'

type AuthenticationOptions = {
  /** Should we authenticate against the public or private api token. @default private */
  tokenType?: 'public' | 'private' | 'gpt'
  /** A custom token to check against. Overrides the tokenType setting. @default undefined */
  token?: string,
  /** The header to get the token from. @default 'Authorization' */
  header?: string
}

export const authenticateRequest = (event: H3Event, options?: AuthenticationOptions) => {
  let inputToken = ''
  let checkToken = ''

  // First get the token from the request headers. In case of Bearer token, extract just the token part.
  if (!options?.header || options.header.toLowerCase() === 'authorization') {
    // First get the token from the request header
    const bearer = getRequestHeader(event, 'Authorization')
    inputToken = bearer?.split(' ')[1] ?? ''
  } else {
    inputToken = getRequestHeader(event, options.header) ?? ''
  }

  // Now get the token to check against. Admin token should always be good
  const config = useRuntimeConfig()
  const adminToken = config.apiToken

  if (options?.token) {
    checkToken = options.token
  } else if (options?.tokenType === 'public') {
    const config = useRuntimeConfig()
    checkToken = config.public.apiToken
  } else if (options?.tokenType === 'gpt') {
    const config = useRuntimeConfig()
    checkToken = config.gptToken
  }

  // Finally compare the tokens
  if (!inputToken || (inputToken !== checkToken && inputToken !== adminToken)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }
}