/**
 * Invalidate cache for specified bases. Prefixes bases 
 * with 'cache:' if not already present.
 * @param bases Array of cache base keys to invalidate.
 * @returns Object with success status and affected bases.
 */
export async function invalidateCacheBases(bases: string[] = []) {
  if (!bases?.length) {
    return {
      success: false,
      message: 'No cache bases provided to invalidate.'
    }
  }

  // Make sure bases have the correct prefix 
  const baseKeys = bases.map(base => !base.startsWith('cache:') ? `cache:${base}` : base)

  await Promise.all(baseKeys.map(async (base) => {
    const storage = useStorage(base)
    // NOTE tmp disabled until https://github.com/nuxt-hub/core/issues/515#issuecomment-2761132340 is resolved
    // await storage.clear()

    const keys = await storage.getKeys()
    do {
      const keysToDelete = keys.splice(0, 1000)
      await Promise.all(keysToDelete.map(async key => await storage.removeItem(key)))
    } while (keys.length)
  }))

  return {
    success: true,
    bases: baseKeys
  }
}

/**
 * Invalidate caches related to projects.
 * @returns Result of cache invalidation.
 */
export async function invalidateProjectCaches() {
  return await invalidateCacheBases(['api:projects', 'routes:projects'])
}