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

  const projects = await db
    .select()
    .from(schema.projects)
    .where(query.status ? eq(schema.projects.status, query.status) : undefined)
    // Join projectImages to get related images
    .leftJoin(
      schema.projectImages,
      eq(schema.projects.id, schema.projectImages.projectId)
    )

  return projects
})
