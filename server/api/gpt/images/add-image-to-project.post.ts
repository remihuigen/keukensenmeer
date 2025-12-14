/**
 * Adds one or more related image objects to a project
 * and validates the blobs exist in Cloudflare bucket.
 * 
 * Body Parameters: AddImagesSchema
 */

import { schema, db } from 'hub:db'
import { blob } from 'hub:blob'
import { and, eq } from 'drizzle-orm'
import { SlugQuerySchema } from '~~/server/utils/validation/queries'
import { addImagesSchema } from '~~/server/utils/validation/payloads'
import { validateZodQuerySchema, validateZodBodySchema } from '~~/server/utils/validation'
import { validateBlobMetaData } from '~~/server/utils/validation/validateBlobMetaData'
import { getImageOrientation } from '~~/server/utils/getImageOrientation.ts'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const { slug } = validateZodQuerySchema(event, SlugQuerySchema)
  const body = await validateZodBodySchema(event, addImagesSchema)

  // Validate all blobs exist and have valid metadata
  const validatedImages: Array<{
    pathname: string
    alt: string
    position: number
    isMainImage: boolean
    width: number
    height: number
    type: string
  }> = []

  for (const imageInput of body.images) {
    // Fetch image metadata from Cloudflare bucket
    const { result: blobObject, error: blobError } = await safeAsync(async () => {
      return await blob.head(imageInput.pathname)
    })

    if (blobError) {
      createErrorResponse({
        statusCode: 500,
        message: `An error occurred while retrieving the image "${imageInput.pathname}" from Cloudflare bucket.`,
        error: blobError
      })
    }

    if (!blobObject) {
      createErrorResponse({
        statusCode: 404,
        message: `Image with pathname "${imageInput.pathname}" not found in Cloudflare bucket. Please upload the image again.`,
      })
    }

    const validatedBlob = validateBlobMetaData(blobObject)

    if (!validatedBlob.isValid) {
      createErrorResponse({
        statusCode: 400,
        message: `Image with pathname "${imageInput.pathname}" has invalid metadata. Please upload the image again.`,
        data: { invalidFields: validatedBlob.invalidFields }
      })
    }

    validatedImages.push({
      pathname: imageInput.pathname,
      alt: imageInput.alt,
      position: imageInput.position || 0,
      isMainImage: imageInput.isMainImage || false,
      width: validatedBlob.data.width,
      height: validatedBlob.data.height,
      type: validatedBlob.data.type
    })
  }

  // Fetch project to get its ID
  const { result: project, error: projectError } = await safeAsync(async () => {
    return await db
      .select({
        id: schema.projects.id
      })
      .from(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .limit(1)
      .then((results) => results[0] || null)
  })

  if (projectError) {
    createErrorResponse({
      statusCode: 500,
      message: 'An error occurred while retrieving the project from the database.',
      error: projectError
    })
  }

  if (!project) {
    createErrorResponse({
      statusCode: 404,
      message: `Project with slug "${slug}" not found.`,
    })
  }

  // If any new image is marked as main image, ensure no other main image exists for this project
  const hasMainImage = validatedImages.some(img => img.isMainImage)
  if (hasMainImage) {
    try {
      await db.update(schema.projectImages).set({ isMainImage: false }).where(and(
        eq(schema.projectImages.projectId, project.id),
        eq(schema.projectImages.isMainImage, true)
      ))
    } catch (error) {
      console.error('Error unsetting previous main image')
      console.error(error)
    }
  }

  try {
    // Prepare image records for batch insert
    const imageRecords = validatedImages.map(img => ({
      projectId: project.id,
      pathname: img.pathname,
      mime: img.type,
      width: img.width,
      height: img.height,
      alt: img.alt,
      position: img.position,
      isMainImage: img.isMainImage,
      orientation: getImageOrientation(img.width, img.height),
    }))

    // Batch insert all images
    const newImages = await db
      .insert(schema.projectImages)
      .values(imageRecords)
      .returning()

    const imageCount = newImages.length
    const message = imageCount === 1 
      ? `Image "${validatedImages[0]?.pathname}" added to project with slug "${slug}" successfully.`
      : `${imageCount} images added to project with slug "${slug}" successfully.`

    return createSuccessResponse(newImages, message)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: `An unexpected error occurred while adding images to project with slug "${slug}".`,
      error
    })
  }

})
