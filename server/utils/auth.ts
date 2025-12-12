// import type { H3Event } from 'h3'

// type AuthenticationOptions = {
//   /** Should we authenticate against the public or private api token. @default private */
//   tokenType?: 'public' | 'private'
//   /** A custom token to check against. Overrides the tokenType setting. @default undefined */
//   token?: string
// }

// export const authenticateRequest = (event: H3Event, options?: AuthenticationOptions) => {
//   let checkToken = ''

//   // First get the token from the request header
//   const bearer = getRequestHeader(event, 'Authorization')
//   const inputToken = bearer?.split(' ')[1]
//   console.log(event.headers.has('Authorization'))
//   console.log(!!bearer)
//   console.log(!!inputToken)

//   console.log(`lowercase bearer: ${getRequestHeader(event, 'authorization')}`)


//   // Now get the token to check against
//   if (options?.token) {
//     checkToken = options.token
//   } else if (options?.tokenType === 'public') {
//     const config = useRuntimeConfig()
//     checkToken = config.public.apiToken
//   } else {
//     const config = useRuntimeConfig()
//     checkToken = config.apiToken
//   }

//   // Finally compare the tokens
//   if (!inputToken || inputToken !== checkToken) {
//     throw createError({
//       statusCode: 403,
//       statusMessage: 'Forbidden',
//       data: {
//         inputTokenMissing: !inputToken,
//         checkTokenIsSet: !!checkToken,
//         tokenType: options?.tokenType || 'private',
//         yourTokenEqualsCheckToken: inputToken === checkToken,
//       }
//     })
//   }
// }


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