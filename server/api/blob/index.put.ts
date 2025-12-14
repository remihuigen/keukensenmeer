import { ACCEPTED_IMAGE_TYPES } from '~~/shared/utils/blob'
import { imageSize } from 'image-size'
import { z } from 'zod'
import { blob } from 'hub:blob'
import type { BlobObject } from '@nuxthub/core/blob'

/**
 * API endpoint to handle multiple file uploads and store them as Blobs using Nuxt Hub Blob module.
 * Reads files from FormData, validates each, extracts dimensions, then uploads.
 * @see https://hub.nuxt.com/docs/features/blob#handleupload
 */
export default defineEventHandler(async (event) => {
  // Only authenticated requests are allowed
  authenticateRequest(event, { tokenType: 'public' })

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, message: 'Missing form data' })

  const files = form.filter(f => f.name === 'files')
  if (!files.length) throw createError({ statusCode: 400, message: 'Missing files' })

  // Process each file: validate MIME type, extract dimensions, and upload
  const typeSchema = z.enum(ACCEPTED_IMAGE_TYPES)
  const uploadedBlobs: BlobObject[] = []

  for (const file of files) {
    const filename = file.filename || 'unknown file'
    
    if (!file.data) {
      throw createError({ statusCode: 400, message: `Missing file data for "${filename}"` })
    }

    const { success } = typeSchema.safeParse(file.type)
    if (!success) {
      throw createError({ 
        statusCode: 400, 
        message: `Invalid file type for "${filename}". Accepted types: ${ACCEPTED_IMAGE_TYPES.join(', ')}` 
      })
    }

    // Get dimensions
    const dimensions = imageSize(file.data)
    const { width, height } = dimensions

    if (!width || !height) {
      throw createError({ 
        statusCode: 400, 
        message: `Could not extract image dimensions for "${filename}"` 
      })
    }

    // Upload single file with metadata
    const uploadedBlob = await blob.put(file.filename || 'image', file.data, {
      addRandomSuffix: true,
      contentType: file.type,
      customMetadata: {
        width: width.toString(),
        height: height.toString(),
        type: file.type ?? 'unknown',
      }
    })

    uploadedBlobs.push(uploadedBlob)
  }

  return uploadedBlobs
})