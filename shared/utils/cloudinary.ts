import { isCloudinaryUrl, type CloudinaryUrl } from "../types"

/**
 * Utility function to create a CloudinaryUrl with validation
 * 
 * @description Validates and creates a CloudinaryUrl type, throwing an error for invalid URLs.
 * Useful for runtime validation when you need to ensure URL validity.
 * 
 * @param url - The URL string to validate and convert
 * @returns Validated CloudinaryUrl
 * @throws Error when the URL doesn't match Cloudinary format
 * 
 * @example           
 * ```typescript
 * try {
 *   const validUrl = createCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg")
 *   // Use validUrl safely
 * } catch (error) {
 *   console.error('Invalid Cloudinary URL:', error.message)
 * }
 * ```
 */
export function createCloudinaryUrl(url: string): CloudinaryUrl {
    if (!isCloudinaryUrl(url)) {
        throw new Error(`Invalid Cloudinary URL format: ${url}`)
    }
    return url
}

/**
 * Sanitizes a Cloudinary URL by only selecting the public id without versioning and file extension
 * @param url 
 * @returns A Cloudinary public ID
 */
export function normalizeCloudinaryUrl(url: CloudinaryUrl): string {
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/')

    // Find the index of 'upload' segment
    const uploadIndex = pathSegments.findIndex(segment => segment === 'upload')
    if (uploadIndex === -1 || uploadIndex + 1 >= pathSegments.length) {
        throw new Error(`Invalid Cloudinary URL structure: ${url}`)
    }

    // Extract the public ID part (everything after 'upload/')
    const publicIdWithVersionAndExtension = pathSegments.slice(uploadIndex + 1).join('/')

    // Remove versioning (e.g., v1234567890) if present
    const publicIdWithoutVersion = publicIdWithVersionAndExtension.replace(/^v\d+\//, '')

    // Remove file extension
    const lastDotIndex = publicIdWithoutVersion.lastIndexOf('.')
    const publicId = lastDotIndex !== -1
        ? publicIdWithoutVersion.substring(0, lastDotIndex)
        : publicIdWithoutVersion

    return publicId
}