import { blob } from 'hub:blob'
import { z } from 'zod'

const QuerySchema = z.object({
  limit: z.number().min(1).max(500).default(10),
  prefix: z.string().optional(),
  cursor: z.string().optional(),
  folded: z.coerce.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const { data, error, success } = QuerySchema.safeParse(getQuery(event))

  if (!success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid query parameters',
      data: error.issues
    })
  }

  const { blobs } = await blob.list(data)

  return blobs
})
