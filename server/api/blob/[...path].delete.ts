import { blob } from 'hub:blob'
/**
 * Delete a blob from the hub blob storage. Requires authentication.
 * @see https://hub.nuxt.com/docs/features/blob#get
 */
export default defineEventHandler(async (event) => {
  // Only authenticated requests are allowed
  authenticateRequest(event)

  const { path } = getRouterParams(event)
  await blob.del(path as string)

  return sendNoContent(event)
})
