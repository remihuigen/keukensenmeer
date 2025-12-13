
import { schema, db } from 'hub:db'
import { eq } from 'drizzle-orm'

import { MIN_FEATURED_PROJECTS, MAX_FEATURED_PROJECTS } from '~~/shared/utils/constants'

/**
 * Validate that adding/removing the specified featured projects
 * will not violate the min/max constraints.
 * @param options - An object containing optional arrays of additions and removals
 * @param options.additions - An array of project slugs to add to the featured list
 * @param options.removals - An array of project slugs to remove from the featured list
 * 
 * @return An object containing the slugs to add, slugs to remove, and the projected count
 *         of featured projects after the additions/removals.
 * @throws Will throw an error if the resulting number of featured projects
 *         would be less than MIN_FEATURED_PROJECTS or more than MAX_FEATURED_PROJECTS.
 */
export const validateNumberOfFeaturedProjects = async (options: {
  additions?: string[],
  removals?: string[]
}) => {
  const { additions, removals } = options

  const currentFeaturedProjects = await db
    .select({ slug: schema.projects.slug })
    .from(schema.projects)
    .where(eq(schema.projects.isFeatured, true))
    .then((results) => results.map((r) => r.slug))

  const toAdd = additions || []
  const toRemove = removals || []

  const projectedFeaturedProjectsSet = new Set(currentFeaturedProjects)

  toAdd.forEach((slug) => projectedFeaturedProjectsSet.add(slug))
  toRemove.forEach((slug) => projectedFeaturedProjectsSet.delete(slug))

  const projectedCount = projectedFeaturedProjectsSet.size

  if (projectedCount < MIN_FEATURED_PROJECTS) {
    createErrorResponse({
      statusCode: 400,
      message: `At least ${MIN_FEATURED_PROJECTS} featured projects are required.`,
      data: {
        currentFeaturedCount: currentFeaturedProjects.length,
        projectedFeaturedCount: projectedCount,
        attemptedAdditions: toAdd,
        attemtedDeletions: toRemove,
      }
    })
  }

  if (projectedCount > MAX_FEATURED_PROJECTS) {
    createErrorResponse({
      statusCode: 400,
      message: `A maximum of ${MAX_FEATURED_PROJECTS} featured projects are allowed.`,
      data: {
        currentFeaturedCount: currentFeaturedProjects.length,
        projectedFeaturedCount: projectedCount,
        attemptedAdditions: toAdd,
        attemtedDeletions: toRemove,
      }
    })
  }

  return {
    toAdd,
    toRemove,
    projectedCount,
  }
}