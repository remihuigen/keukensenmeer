/**
 * Get unique base cache keys up to a specified depth
 */

import { z } from 'zod'

const QuerySchema = z.object({
  // Depth parameter to specify how many segments of the key to consider as the base
  // Normalize string input to integer
  depth: z
    .string()
    .optional()
    .default('2')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Depth must be a positive integer.'
    })
    .describe('Depth indicates how many segments of the cache key to consider as the base. For example, depth=2 for key "a:b:c:d" results in base "a:b".'),
  exclude: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .default([])
    .transform((val) => (typeof val === 'string' ? val.split(',').map(s => s.trim()) : val))
    .describe('Comma-separated list of base keys to exclude from the results.')
})
export default defineEventHandler(async (event) => {
  authenticateRequest(event)

  const query = getQuery(event)

  const { success, data, error } = QuerySchema.safeParse(query)
  if (!success) {
    throw createError({ statusCode: 400, message: 'Invalid query parameters', data: error.issues })
  }

  const cache = useStorage('cache')

  const keys = await cache.getKeys()

  // Remove the last segment from each key to get the base
  const bases = keys.map(key => {
    const parts = key.split(':')
    parts.pop()
    key = parts.join(':')
    return key
  })

  // Only list unique base keys for the specified depth
  const uniqueBases = Array.from(new Set(bases.map(base => {
    const parts = base.split(':')
    if (parts.length >= data.depth) {
      return parts.slice(0, data.depth).join(':')
    }
    return base
  })))

  // Exclude any specified keys
  const filteredBases = data.exclude
    ? uniqueBases.filter(base => data.exclude.some(excludeKey => base.startsWith(excludeKey)) === false)
    : uniqueBases

  return {
    data: filteredBases
  }
})
