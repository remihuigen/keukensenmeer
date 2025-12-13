/**
 * List all projects
 * 
 * Params:
 * - status (string, optional): Filter projects by status ('published' | 'draft' | 'archived')
 */

import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { StatusQuerySchema } from '~~/server/utils/validation/queries'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = await getValidatedQuery(event, StatusQuerySchema.parse)

  return await db.query.projects.findMany({
    where: query.status ? eq(schema.projects.status, query.status) : undefined,
    with: {
      images: true,
    }
  })
})
