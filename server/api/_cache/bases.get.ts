/**
 * Get unique base cache keys up to a specified depth
 */
export default defineEventHandler(async (event) => {
  authenticateRequest(event)

  const query = getQuery(event)
  const inputDepth = query.depth ? parseInt(query.depth?.toString(), 10) : NaN
  const depth = !Number.isNaN(inputDepth) && inputDepth >= 1 ? inputDepth : 2

  const cache = useStorage('cache')

  const keys = await cache.getKeys()

  // Only list unique base keys for the specified depth
  const uniqueBases = Array.from(new Set(keys.map(key => {
    const parts = key.split(':')
    if (parts.length >= depth) {
      return parts.slice(0, depth).join(':')
    }
    return key
  })))

  return {
    data: uniqueBases
  }
})
