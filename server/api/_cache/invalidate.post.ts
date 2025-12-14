// https://unstorage.unjs.io/guide#clearbase-opts

import { invalidateCacheBases } from '~~/server/utils/invalidateCacheBases'

/**
 * API endpoint to invalidate cache for specified bases.
 * If no bases are provided, defaults to common bases.
 */
export default defineEventHandler(async (event) => {
  authenticateRequest(event)

  const { bases } = getQuery(event)

  let cacheBases: string[] = typeof bases === 'string' ? bases.split(',') : Array.isArray(bases) ? bases : []

  if (!cacheBases?.length) {
    cacheBases = [
      'nitro:routes',
      'pages',
    ]
  }

  const { bases: baseKeys } = await invalidateCacheBases(cacheBases)
  return {
    message: `Cache invalidated.`,
    bases: baseKeys
  }
})
