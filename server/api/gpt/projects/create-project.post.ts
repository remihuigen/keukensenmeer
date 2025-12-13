/**
 * Create a new project and (optionally) its related images,
 * validating that the images exist in the Cloudflare bucket.
 * Body Parameters: ProjectCreateSchema
 */


import { schema, db } from 'hub:db'
import { blob } from 'hub:blob'

import { projectCreateSchema, type ImageCreateSchema } from '~~/server/utils/validation/payloads';
import { validateNumberOfFeaturedProjects } from '~~/server/utils/validateNumberOfFeaturedProjects'
import { slugify } from '~~/server/utils/slugify'
import type { BlobObject } from '@nuxthub/core/blob'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const body = await readValidatedBody(event, projectCreateSchema.parse)

  // 1) Create a slug for the project
  const slug = slugify(body.publicTitle)

  // 2) Check if this project is marked as featured. If so, ensure that there are not already
  // the maximum/minimum number of featured projects.
  if (body.isFeatured) {
    await validateNumberOfFeaturedProjects({
      additions: [slug],
    })
  }

  // 3) Check if there are related images to add
  const images = body.images || []
  // For later use when inserting into DB
  const imagesWithBlob: Array<ImageCreateSchema & { blob: BlobObject }> = []

  if (images.length) {
    // 4a) Check if there are multiple main images (not allowed). Return an error if so.
    const mainImages = images.filter((img) => img.isMainImage)
    if (mainImages.length > 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Multiple main images provided. A project can have only one main image.',
      })
    }

    // 4b) Fetch their metadata from Cloudflare bucket (we need size, format, etc. to store in DB)
    const imageData = await Promise.allSettled(
      images.map(async (img) => ({
        ...img,
        blob: await blob.head(img.pathname)
      }))
    )

    // 4c) If any of the provided images do not exist in Cloudflare, return an error
    const invalidImages = imageData
      .filter((result) => result.status === 'rejected')
      .map((result, index) => ({ result, index }))
      .map(({ index }) => images[index]!.pathname)

    if (invalidImages.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Some provided images do not exist in the Cloudflare bucket.',
        data: { invalidImages }
      })
    }

    // 4d) If any of the images are missing required metadata, return an error
    const imagesWithoutValidMetaData = imageData
      .filter((result) => result.status === 'fulfilled' && (
        !result.value.blob.size ||
        !result.value.blob.customMetadata.type ||
        !result.value.blob.customMetadata.width ||
        !result.value.blob.customMetadata.height
      ))
      .map((result, index) => ({ result, index }))
      .map(({ index }) => images[index]!.pathname)

    if (imagesWithoutValidMetaData.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Some provided images are missing required metadata in the Cloudflare bucket. Please upload them again.',
        data: { imagesWithoutValidMetaData }
      })
    }

    // 4e) Collect images with valid blob objects for later insertion
    for (const blob of imageData) {
      if (blob.status !== 'fulfilled') continue
      imagesWithBlob.push(blob.value)
    }
  }

  // 6) Create the project record and related images in the database
  try {
    const createdProject = await db.transaction(async (tx) => {
      // 6a) insert the project
      const insertedProject = await tx
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

      const projectId = insertedProject[0]?.id
      // 6b) insert related images if any
      if (imagesWithBlob.length > 0 && projectId) {

        // Prepare image records for insertion
        const imageRecords = imagesWithBlob.map(image => {
          return {
            projectId,
            pathname: image.pathname,
            alt: image.alt,
            isMainImage: image.isMainImage || false,
            size: image.blob.size,
            mime: image.blob.customMetadata.type ?? 'unknown',
            width: image.blob.customMetadata.width ? parseInt(image.blob.customMetadata.width, 10) : 300, // use 300 as fallback. Should not happen due to validations
            height: image.blob.customMetadata.height ? parseInt(image.blob.customMetadata.height, 10) : 300, // use 300 as fallback. Should not happen due to validations
          }
        }) satisfies Array<typeof schema.projectImages.$inferInsert>

        await tx
          .insert(schema.projectImages)
          .values(imageRecords)

        return {
          project: insertedProject[0],
          images: imageRecords,
        }
      }
    })

    return { success: true, message: 'Project created successfully.', data: createdProject }

  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to create project.',
      data: { error }
    })
  }
})
