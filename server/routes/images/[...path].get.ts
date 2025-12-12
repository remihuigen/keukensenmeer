import { blob } from 'hub:blob'
export default defineEventHandler((event) => {
  const { path } = getRouterParams(event)

  setHeader(event, 'Content-Security-Policy', 'default-src \'none\';')
  return blob.serve(event, path as string)
})