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
import { validateZodBodySchema } from '~~/server/utils/validation'

import { z } from 'zod'
const UpdateFeaturedProjectsQuerySchema = z.object({
  add: z.array(z.string().min(1)).optional().describe('An array of project slugs to add to the featured list'),
  remove: z.array(z.string().min(1)).optional().describe('An array of project slugs to remove from the featured list'),
})

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const body = await validateZodBodySchema(event, UpdateFeaturedProjectsQuerySchema)

  if (!body.add?.length && !body.remove?.length) {
    createErrorResponse({
      statusCode: 400,
      message: 'At least one of "add" or "remove" arrays must be provided and contain at least one slug.',
      data: { receivedBody: body }
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
    const added = []
    const removed = []

    // Add featured flag
    if (toAdd.length > 0) {
      const newFeaturedProjects = await db
        .update(schema.projects)
        .set({ isFeatured: true })
        .where(inArray(schema.projects.slug, toAdd))
        .returning({ slug: schema.projects.slug })

      for (const project of newFeaturedProjects) {
        added.push(project.slug)
      }
    }
    // Remove featured flag
    if (toRemove.length > 0) {
      const removedFeaturedProject = await db
        .update(schema.projects)
        .set({ isFeatured: false })
        .where(inArray(schema.projects.slug, toRemove))
        .returning({ slug: schema.projects.slug })

      for (const project of removedFeaturedProject) {
        removed.push(project.slug)
      }
    }

    return createSuccessResponse({
      added,
      removed,
      projectedCount,
    }, `Featured projects updated successfully. Total featured projects now: ${projectedCount}.`)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: 'An unexpected error occurred while updating featured projects.',
      error
    })
  }
})
