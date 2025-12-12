import { ACCEPTED_IMAGE_TYPES } from '~~/shared/utils/blob'
/**
 * API endpoint to handle file upload and store it as a Blob using Nuxt Hub Blob module.
 * @see https://hub.nuxt.com/docs/features/blob#handleupload
 */
export default eventHandler(async (event) => {
  // Only authenticated requests are allowed
  authenticateRequest(event, { tokenType: 'public' })

  return hubBlob().handleUpload(event, {
    formKey: 'files', // read file or files form the `formKey` field of request body (body should be a `FormData` object)
    multiple: false, // when `true`, the `formKey` field will be an array of `Blob` objects
    ensure: {
      types: ACCEPTED_IMAGE_TYPES
    },
    put: {
      addRandomSuffix: true
    }
  })
})