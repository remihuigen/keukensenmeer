// https://unstorage.unjs.io/guide#clearbase-opts

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

  const baseKeys = cacheBases.map(base => !base.startsWith('cache:') ? `cache:${base}` : base)

  // Code is similar to https://github.com/nuxt-hub/core/blob/main/src/runtime/cache/server/api/_hub/cache/clear/%5B...base%5D.delete.ts
  // Except were clearing multiple bases at once
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
    message: `Cache invalidated.`,
    bases: baseKeys
  }
})
