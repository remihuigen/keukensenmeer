import type { H3Event } from 'h3'

type AuthenticationOptions = {
  /** Should we authenticate against the public or private api token. @default private */
  tokenType?: 'public' | 'private'
  /** A custom token to check against. Overrides the tokenType setting. @default undefined */
  token?: string
  /** Which header to check against. Defaults to bearer token */
  header?: string
}

export const authenticateRequest = (event: H3Event, options?: AuthenticationOptions) => {
  let inputToken = ''
  let checkToken = ''

  // First get the requests token. If bearer is used, we extract the token from the "Authorization" header
  if (!options?.header || options.header === 'Authorization') {
    const bearer = getRequestHeader(event, 'Authorization')
    inputToken = bearer?.split(' ')[1] || ''
  } else {
    inputToken = getRequestHeader(event, options.header) || ''
  }


  // Now get the token to check against
  if (options?.token) {
    checkToken = options.token
  } else if (options?.tokenType === 'public') {
    const config = useRuntimeConfig()
    checkToken = config.public.apiToken
  } else {
    const config = useRuntimeConfig()
    checkToken = config.apiToken
  }

  // Finally compare the tokens
  if (!inputToken || inputToken !== checkToken) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: {
        yourToken: inputToken,
        checkTokenIsSet: !!checkToken,
        tokenType: options?.tokenType || 'private',
        yourTokenEqualsCheckToken: inputToken === checkToken,
      }
    })
  }
}
