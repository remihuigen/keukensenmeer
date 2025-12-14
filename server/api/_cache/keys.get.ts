/**
 * Get all cache keys
 */
export default defineEventHandler(async (event) => {
  authenticateRequest(event)

  const cache = useStorage('cache')
  const keys = await cache.getKeys()
  return {
    data: keys
  }
})
