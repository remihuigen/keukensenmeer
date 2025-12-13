/**
 * Adds or removes one or more projects from the featured projects list,
 * that is displayed on the homepage.
 * 
 * Query Parameters:
 * - add: string[] (optional) - An array of project slugs to add to the featured list
 * - remove: string[] (optional) - An array of project slugs to remove from the featured list
 * 
 */

import { schema, db } from 'hub:db'
import { inArray } from 'drizzle-orm'

import { validateNumberOfFeaturedProjects } from '~~/server/utils/validateNumberOfFeaturedProjects'

import { z } from 'zod'
const UpdateFeaturedProjectsQuerySchema = z.object({
  add: z.array(z.string().min(1)).optional().describe('An array of project slugs to add to the featured list'),
  remove: z.array(z.string().min(1)).optional().describe('An array of project slugs to remove from the featured list'),
})

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const body = await readValidatedBody(event, UpdateFeaturedProjectsQuerySchema.parse)

  if (!body.add?.length && !body.remove?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one of "add" or "remove" arrays must be provided and contain at least one slug.',
    })
  }

  // First, check the current featured projects, and calculate how many items will be in the list
  // after the requested additions and removals. 
  const { toAdd, toRemove, projectedCount } = await validateNumberOfFeaturedProjects({
    additions: body.add,
    removals: body.remove,
  })

  // Proceed with the updates
  try {
    // Add featured flag
    if (toAdd.length > 0) {
      await db
        .update(schema.projects)
        .set({ isFeatured: true })
        .where(inArray(schema.projects.slug, toAdd))
    }
    // Remove featured flag
    if (toRemove.length > 0) {
      await db
        .update(schema.projects)
        .set({ isFeatured: false })
        .where(inArray(schema.projects.slug, toRemove))
    }

    return {
      success: true,
      message: `Featured projects updated successfully. Total featured projects now: ${projectedCount}.`,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update featured projects.',
      data: { error }
    })
  }

})
