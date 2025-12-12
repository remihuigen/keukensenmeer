/**
 * Gets a blob from the hub blob storage.
 * @see https://hub.nuxt.com/docs/features/blob#get
 */
export default defineEventHandler(async (event) => {
  // Only authenticated requests are allowed
  authenticateRequest(event)

  const { path } = getRouterParams(event)
  await hubBlob().del(path as string)

  return sendNoContent(event)
})
