import type { CloudinaryUrl } from "."

/**
 * Base project input data structure
 * 
 * @description Defines the structure for project data input, typically used when
 * creating or updating project records. Includes validation for Cloudinary URLs.
 * 
 * @example
 * ```typescript
 * const projectInput: ProjectInput = {
 *   title: 'Modern Kitchen Design',
 *   mainImage: 'https://res.cloudinary.com/demo/image/upload/kitchen.jpg' as const,
 *   description: 'A sleek contemporary kitchen with marble countertops'
 * }
 * ```
 */
export interface ProjectInput {
    title: string
    mainImage: CloudinaryUrl
    description: string
}

/**
 * Complete project data structure with generated fields
 * 
 * @description Extends ProjectInput with auto-generated slug and converts
 * mainImage to a regular string after validation. Used for stored project data.
 * 
 * @example
 * ```typescript
 * const project: Project = {
 *   title: 'Modern Kitchen Design',
 *   slug: 'modern-kitchen-design',
 *   mainImage: 'https://res.cloudinary.com/demo/image/upload/kitchen.jpg',
 *   description: 'A sleek contemporary kitchen with marble countertops'
 * }
 * ```
 */
export interface Project {
    title: string
    slug: string
    mainImage: string
    description: string
}

/**
 * Minimal project data for overview/listing displays
 * 
 * @description Contains only the essential fields needed for project cards,
 * listings, and navigation components. Optimized for performance.
 * 
 * @example
 * ```typescript
 * const overviewItem: ProjectOverviewItem = {
 *   title: 'Modern Kitchen Design',
 *   slug: 'modern-kitchen-design',
 *   mainImage: 'https://res.cloudinary.com/demo/image/upload/kitchen.jpg'
 * }
 * ```
 */
export interface ProjectOverviewItem {
    title: string
    slug: string
    mainImage: string
}