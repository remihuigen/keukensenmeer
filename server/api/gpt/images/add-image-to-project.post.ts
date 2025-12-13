/**
 * Adds a new related image object to a project
 * and validates the blob exists in Cloudflare bucket.
 * 
 * Body Parameters: ImageInput
 */

import { schema, db } from 'hub:db'
import { blob } from 'hub:blob'
import { and, eq } from 'drizzle-orm'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'
import { imageCreateSchema } from '~~/server/utils/validation/payloads'

export default defineEventHandler(async (_event) => {
  authenticateRequest(_event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const query = await getValidatedQuery(_event, SlugQuerySchema.parse)
  const body = await readValidatedBody(_event, imageCreateSchema.parse)

  // Fetch image metadata from Cloudflare bucket (we need size, format, etc. to store in DB)
  try {
    const blobObject = await blob.head(body.pathname)

    if (!blobObject) {
      throw createError({
        statusCode: 404,
        statusMessage: `Image with pathname "${body.pathname}" not found in Cloudflare bucket. Please upload the image again.`,
      })
    }
    // Fetch project to get its ID
    const project = await db
      .select({
        id: schema.projects.id
      })
      .from(schema.projects)
      .where(eq(schema.projects.slug, query.slug))
      .limit(1)
      .then((results) => results[0] || null)

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: `Project with slug "${query.slug}" not found.`,
      })
    }

    // If the new image is marked as main image, ensure no other main image exists for this project
    if (body.isMainImage) {
      await db.update(schema.projectImages).set({ isMainImage: false }).where(and(
        eq(schema.projectImages.projectId, project.id),
        eq(schema.projectImages.isMainImage, true)
      ))
    }

    // Insert new image record linked to the project 
    const newImage = await db
      .insert(schema.projectImages)
      .values({
        projectId: project.id,
        pathname: body.pathname,
        alt: body.alt,
        position: body.position || 0,
        isMainImage: body.isMainImage || false,
        url: blobObject.url,
        size: blobObject.size,
        mime: blobObject.customMetadata.mime || 'unknown',
        width: blobObject.customMetadata.width ? parseInt(blobObject.customMetadata.width, 10) : 300, // Default to 300 if not provided
        height: blobObject.customMetadata.height ? parseInt(blobObject.customMetadata.height, 10) : 300, // Default to 300 if not provided
      })

    return newImage
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to add image to project with slug "${query.slug}".`,
      data: { error }
    })
  }

})
