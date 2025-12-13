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
import type { BlobObject } from '@nuxthub/core/blob'

export default defineEventHandler(async (event) => {
  authenticateRequest(event, { tokenType: 'gpt' }) // Returns a 403 if authentication fails

  const body = await readValidatedBody(event, projectCreateSchema.parse)

  // 1) Create a slug for the project
  const slug = slugify(body.publicTitle, { lower: true, strict: true, locale: 'nl' })

  // 2) Check if there are related images to add
  const images = body.images || []
  // For later use when inserting into DB
  const imagesWithBlob: Array<ProjectImageCreateSchema & { blob: BlobObject }> = []

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
      images.map(async (img) => ({
        ...img,
        blob: await blob.head(img.pathname)
      }))
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

    // 3d) If any of the images are missing required metadata, return an error
    const imagesWithoutValidMetaData = imageData
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'fulfilled' && (
        !result.value.blob.customMetadata.mime ||
        !result.value.blob.customMetadata.size ||
        !result.value.blob.customMetadata.width ||
        !result.value.blob.customMetadata.height
      ))
      .map(({ index }) => images[index].pathname)

    if (imagesWithoutValidMetaData.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Some provided images are missing required metadata in the Cloudflare bucket. Please upload them again.',
        data: { imagesWithoutValidMetaData }
      })
    }

    // 3e) Collect images with valid blob objects for later insertion
    for (const blob of imageData) {
      if (blob.status !== 'fulfilled') continue
      imagesWithBlob.push(blob.value)
    }
  }

  // 5) Create the project record and related images in the database
  try {
    const createdProject = await db.transaction(async (tx) => {
      // First, insert the project
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

      // Second, insert related images if any
      if (imagesWithBlob.length > 0) {
        const projectId = insertedProject[0].id

        // 4) Prepare image records for insertion
        const imageRecords = imagesWithBlob.map(image => {
          return {
            projectId,
            pathname: image.pathname,
            alt: image.alt,
            isMainImage: image.isMainImage || false,
            size: image.blob.size,
            mime: image.blob.customMetadata.mime ?? 'unknown',
            width: image.blob.customMetadata.width ? parseInt(image.blob.customMetadata.width, 10) : 300, // use 300 as fallback. Should not happen due to validations
            height: image.blob.customMetadata.height ? parseInt(image.blob.customMetadata.height, 10) : 300, // use 300 as fallback. Should not happen due to validations
          }
        }) satisfies Array<typeof schema.projectImages.$inferInsert>

        const res = await tx
          .insert(schema.projectImages)
          .values(imageRecords)

        console.log('Inserted images:', res)

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
