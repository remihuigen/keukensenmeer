/**
 * Type guard to validate Cloudinary URL format
 * 
 * @description Checks if a string matches Cloudinary URL pattern.
 * Supports both secure (https) and legacy (http) URLs with various domain formats.
 * 
 * @param url - The URL string to validate
 * @returns Type predicate indicating if the URL is a valid Cloudinary URL
 * 
 * @example
 * ```typescript
 * const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 * if (isCloudinaryUrl(url)) {
 *   // TypeScript knows url is CloudinaryUrl
 *   console.log(`Valid Cloudinary URL: ${url}`)
 * }
 * ```
 */
export function isCloudinaryUrl(url: string): url is CloudinaryUrl {
    const cloudinaryPattern = /^https?:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/(image|video|raw)\/upload\/.+$/
    return cloudinaryPattern.test(url)
}

/**
 * Template literal type for Cloudinary URLs
 * 
 * @description Validates Cloudinary URL format at the type level.
 * Supports both secure (https) and legacy (http) URLs.
 * 
 * @example
 * ```typescript
 * // ✅ Valid - will be accepted
 * const validUrl: CloudinaryUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 * 
 * // ❌ Invalid - TypeScript error
 * const invalidUrl: CloudinaryUrl = "https://example.com/image.jpg"
 * ```
 */
export type CloudinaryUrl = `${'https' | 'http'}://res.cloudinary.com/${string}/image/upload/${string}`


export type Image = {
    /* Cloudinary image URL */
    src: CloudinaryUrl
    alt: string
}