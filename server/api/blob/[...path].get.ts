import { blob } from 'hub:blob'

/**
 * Gets a blob from the hub blob storage.
 * @see https://hub.nuxt.com/docs/features/blob#get
 */
export default defineEventHandler(async (event) => {
  const { path } = getRouterParams(event)
  setHeader(event, 'Content-Security-Policy', 'default-src \'none\';')
  return await blob.get(path as string)
})
