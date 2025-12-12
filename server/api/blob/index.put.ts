import { ACCEPTED_IMAGE_TYPES } from '~~/shared/utils/blob'
import { imageSize } from 'image-size'
import { z } from 'zod'

/**
 * API endpoint to handle file upload and store it as a Blob using Nuxt Hub Blob module.
 * Reads the file from FormData, validates, extracts dimensions, then uploads.
 * @see https://hub.nuxt.com/docs/features/blob#handleupload
 */
export default eventHandler(async (event) => {
  // Only authenticated requests are allowed
  // authenticateRequest(event, { tokenType: 'public' })

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ status: 400, message: 'Missing form data' })

  const file = form.find(f => f.name === 'files')
  if (!file || !file.data) throw createError({ status: 400, message: 'Missing file' })

  // validate MIME type, otherwise we cant read dimensions
  const typeSchema = z.enum(ACCEPTED_IMAGE_TYPES)
  const { success } = typeSchema.safeParse(file.type)

  if (!success) {
    throw createError({ status: 400, message: `Invalid file type. Accepted types: ${ACCEPTED_IMAGE_TYPES.join(', ')}` })
  }

  // get dimensions
  const dimensions = imageSize(file.data) // file.data is Buffer
  const { width, height } = dimensions

  return hubBlob().handleUpload(event, {
    formKey: 'files', // read file or files form the `formKey` field of request body (body should be a `FormData` object)
    multiple: false, // when `true`, the `formKey` field will be an array of `Blob` objects
    ensure: {
      types: ACCEPTED_IMAGE_TYPES
    },
    put: {
      addRandomSuffix: true,
      customMetadata: {
        width: width?.toString() ?? '',
        height: height?.toString() ?? '',
        type: file.type ?? 'unknown',
      }
    }
  })
})