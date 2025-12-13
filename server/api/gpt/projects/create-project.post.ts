/**
 * Create a new project and (optionally) its related images.
 * 
 * Body Parameters: ProjectInput
 */


import slugify from 'slugify'
import { schema, db } from 'hub:db'
import { blob } from 'hub:blob'

import type { ProjectImageCreateSchema } from '~~/server/utils/validation/payloads';
import { projectCreateSchema } from '~~/server/utils/validation/payloads'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const body = await readValidatedBody(event, projectCreateSchema.parse)

  // 1) Create a slug for the project
  const slug = slugify(body.publicTitle, { lower: true, strict: true, locale: 'nl' })

  // 2) Check if there are related images to add
  const images = body.images || []
  let imageRecords: ProjectImageCreateSchema[] = []

  if (images.length) {
    // 3a) Check if there are multiple main images (not allowed). Return an error if so.
    const mainImages = images.filter((img) => img.isMainImage)
    if (mainImages.length > 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Multiple main images provided. A project can have only one main image.',
      })
    }

    // 3b) Fetch their metadata from Cloudflare bucket (we need size, format, etc. to store in DB)
    const imageData = await Promise.allSettled(
      images.map((img) => blob.head(img.pathname))
    )

    // 3c) If any of the provided images do not exist in Cloudflare, return an error
    const invalidImages = imageData
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ index }) => images[index].pathname)

    if (invalidImages.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Some provided images do not exist in the Cloudflare bucket.',
        data: { invalidImages }
      })
    }

    // 4) Prepare image records for insertion
    imageRecords = imageData.map((result, index) => {
      const img = images[index]
      if (result.status !== 'fulfilled') return
      const blobObject = result.value
      return {
        pathname: img.pathname,
        alt: img.alt,
        isMainImage: img.isMainImage || false,
        size: blobObject.size,
        mime: blobObject.customMetadata.mime ?? 'unknown',
        width: blobObject.customMetadata.width ? parseInt(blobObject.customMetadata.width, 10) : null,
        height: blobObject.customMetadata.height ? parseInt(blobObject.customMetadata.height, 10) : null,
      }
    }).filter((img): img is NonNullable<typeof img> => !!img)
  }

  // 5) Create the project record and related images in the database
  try {
    const createdProject = await db
      .insert(schema.projects)
      .values({
        title: body.title,
        publicTitle: body.publicTitle,
        slug,
        status: body.status,
        body: body.body,
        description: body.description,
        styles: body.styles,
      })
      .returning()

    return { success: true, message: 'Project created successfully.', data: { project: createdProject[0], images: imageRecords } }

  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to create project.',
      data: { error }
    })
  }
})
