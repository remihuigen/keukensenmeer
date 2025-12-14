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
import { validateZodQuerySchema, validateZodBodySchema } from '~~/server/utils/validation'
import { validateBlobMetaData } from '~~/server/utils/validation/validateBlobMetaData'
import { getImageOrientation } from '~~/server/utils/getImageOrientation.ts'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const { slug } = validateZodQuerySchema(event, SlugQuerySchema)
  const body = await validateZodBodySchema(event, imageCreateSchema)

  // Fetch image metadata from Cloudflare bucket (we need size, format, etc. to store in DB)
  const { result: blobObject, error: blobError } = await safeAsync(async () => {
    return await blob.head(body.pathname)
  })

  if (blobError) {
    createErrorResponse({
      statusCode: 500,
      message: `An error occurred while retrieving the image "${body.pathname}" from Cloudflare bucket.`,
      error: blobError
    })
  }

  if (!blobObject) {
    createErrorResponse({
      statusCode: 404,
      message: `Image with pathname "${body.pathname}" not found in Cloudflare bucket. Please upload the image again.`,
    })
  }


  const validatedBlob = validateBlobMetaData(blobObject)

  if (!validatedBlob.isValid) {
    createErrorResponse({
      statusCode: 400,
      message: `Image with pathname "${body.pathname}" has invalid metadata. Please upload the image again.`,
      data: { invalidFields: validatedBlob.invalidFields }
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

  // If the new image is marked as main image, ensure no other main image exists for this project
  if (body.isMainImage) {
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
    // Insert new image record linked to the project 
    const newImage = await db
      .insert(schema.projectImages)
      .values([{
        projectId: project.id,
        pathname: body.pathname,
        mime: validatedBlob.data.type,
        width: validatedBlob.data.width,
        height: validatedBlob.data.height,
        alt: body.alt,
        position: body.position || 0,
        isMainImage: body.isMainImage || false,
        orientation: getImageOrientation(validatedBlob.data.width, validatedBlob.data.height),
      }])

    return createSuccessResponse(newImage, `Image "${body.pathname}" added to project with slug "${slug}" successfully.`)
  } catch (error) {
    createErrorResponse({
      statusCode: 500,
      message: `An unexpected error occurred while adding image to project with slug "${slug}".`,
      error
    })
  }

})
