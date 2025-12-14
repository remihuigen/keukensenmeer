import { z } from 'zod'
import { statusEnum, styleEnum } from '../../db/schema/fields/enums'

// ---------------------------------------------
// Node / Body schema
// ---------------------------------------------

/**
 * Schema for plain text nodes inside a paragraph.
 * Represents the smallest chunk of textual content in the document tree.
 */
const TextNodeSchema = z.object({
  text: z.string().min(1).describe('Raw text value inside a paragraph node'),
}).describe('Plain text node')

/**
 * Schema describing a paragraph node.
 * Each paragraph wraps a list of text children which together form continuous content.
 */
const ParagraphNodeSchema = z.object({
  type: z.literal('paragraph').describe('Indicates this node is a paragraph'),
  children: z
    .array(TextNodeSchema)
    .min(1)
    .describe('List of text fragments belonging to the paragraph'),
}).describe('Paragraph node within the project body')

/**
 * Union wrapper for body nodes.
 * Right now only paragraphs exist — but future-proofing is king.
 */
const BodyNodeSchema = z
  .union([ParagraphNodeSchema])
  .describe('A single content node in the project body')

// ---------------------------------------------
// Reusable fields
// ---------------------------------------------

/**
 * Slug field.
 * Clients never set this — the backend regenerates it when needed.
 */
const slug = z
  .never()
  .optional()
  .describe('Slug is generated server-side and cannot be provided')

/**
 * Internal project title.
 * Used for editors, not for public display.
 */
const title = z
  .string()
  .min(1)
  .describe('Internal title for the project')

/**
 * Public-facing title.
 * Needs to be long enough to not look like a toddler named it.
 */
const publicTitle = z
  .string()
  .min(4, 'Public title should have a minimum of 4 characters')
  .describe('Public-facing project title shown to visitors')

/**
 * Publication status enum.
 * Defaults to "draft". Classic.
 */
const status = z
  .enum(statusEnum)
  .default('draft')
  .describe('Publication status of the project')

/**
 * Indicates whether the project should be featured.
 * Appears in prominent UI components.
 */
const isFeatured = z
  .boolean()
  .optional()
  .describe('Whether the project should be highlighted on the homepage')

/**
 * Determines display priority.
 * Lower number means higher priority. Welcome to inverted logic.
 */
const sortingPriority = z
  .number()
  .int()
  .min(0)
  .max(100)
  .optional()
  .describe('Display priority from 0 (highest) to 100 (lowest)')

/**
 * Short descriptive summary.
 * Must be long enough for the model — and humans — to understand context.
 */
const description = z
  .string()
  .min(60, 'Use at least 60 characters to describe the project')
  .describe('Short project summary')

/**
 * Structured body content.
 * Accepts an ordered list of nodes representing rich content.
 */
const body = z
  .array(BodyNodeSchema)
  .min(1)
  .describe('The structured content body of the project')

/**
 * List of visual or conceptual style tags.
 * Used for filtering, theming, and maybe vibes.
 */
const styles = z
  .array(z.enum(styleEnum))
  .min(1)
  .describe('List of design styles that apply to this project')

/**
 * Styles delta schema.
 * Supports full replacement OR granular add/remove mutation.
 *
 * @example
 * // Full override
 * { styles: ["minimal", "industrial"] }
 *
 * @example
 * // Incremental edits
 * { styles: { add: ["minimal"], remove: ["vintage"] } }
 */
const stylesDelta = z
  .union([
    z.array(z.enum(styleEnum)).min(1),
    z.object({
      add: z.array(z.enum(styleEnum)).optional(),
      remove: z.array(z.enum(styleEnum)).optional(),
    }),
  ])

const pathname = z
  .string()
  .min(1)
  .describe('The Cloudflare R2 pathname of the uploaded image')

const alt = z
  .string()
  .min(32, 'Alt text should be at least 32 characters long')
  .describe('Accessible alt text for the image, so the GPT model can describe it')

const position = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Sorting order inside the gallery')

const isMainImage = z
  .boolean()
  .optional()
  .describe('Marks this image as the primary image of the project. A project can have only one main image.')

// ---------------------------------------------
// Project Image schema
// ---------------------------------------------

/**
 * Schema describing the creation of a project image.
 * Width/height/mime/orientation are intentionally stripped — R2 knows better than we do.
 */
export const imageCreateSchema = z
  .object({
    pathname,
    alt,
    position,
    isMainImage,
  })
  .describe('Image to associate with the project during creation')

export type ImageCreateSchema = z.infer<typeof imageCreateSchema>


// ---------------------------------------------
// Project create schema
// ---------------------------------------------

/**
 * Schema for creating a project.
 * Fully defines the initial payload including optional images.
 */
export const projectCreateSchema = z
  .object({
    title,
    publicTitle,
    slug,
    status,
    isFeatured,
    sortingPriority,
    styles,
    description,
    body,
    images: z
      .array(imageCreateSchema)
      .optional()
      .describe('Optional list of images to create alongside the project'),
  })
  .describe('Payload used to create a new project including optional images')

export type ProjectCreateSchema = z.infer<typeof projectCreateSchema>

// ---------------------------------------------
// Project update schema
// ---------------------------------------------

/**
 * Schema for updating an existing project.
 * All fields are optional and partial. Slug is never set by clients.
 *
 * @example
 * // Update only description
 * { description: "New description..." }
 *
 * @example
 * // Update styles incrementally
 * { styles: { add: ["minimal"], remove: ["brutalist"] } }
 */
export const projectUpdateSchema = z
  .object({
    title: title.optional(),
    publicTitle: publicTitle.optional(),
    slug: slug,
    sortingPriority: sortingPriority.optional(),
    status: status.optional(),
    description: description.optional(),
    body: body.optional(),
    styles: stylesDelta.optional(),
  })
  .describe('Payload used to update an existing project')

export type ProjectUpdateSchema = z.infer<typeof projectUpdateSchema>

/**
 * Schema for updating featured projects.
 * Contains two optional arrays: one for additions and one for removals.
 * At least one array must be provided with at least one slug.
 * 
 * - add: string[] (optional) - An array of project slugs to add to the featured list
 * - remove: string[] (optional) - An array of project slugs to remove from the featured list
 * 
 */
export const updateFeaturedProjectsQuerySchema = z.object({
  add: z.array(z.string().min(1)).optional().describe('An array of project slugs to add to the featured list'),
  remove: z.array(z.string().min(1)).optional().describe('An array of project slugs to remove from the featured list'),
})

/**
 * Schema for deleting one or more images from a project.
 * Contains an array of pathnames of images to be removed.
 */
export const deleteImageSchema = z.object({
  pathnames: z.array(z.string().min(1)).min(1).describe('Array of pathnames of images to be removed from the project, as stored in the Cloudflare bucket')
})

export type DeleteImageSchema = z.infer<typeof deleteImageSchema>

/**
 * Schema for adding one or more images to a project.
 * Contains an array of image data.
 */
export const addImagesSchema = z.object({
  images: z.array(imageCreateSchema).min(1).describe('Array of images to add to the project')
})

export type AddImagesSchema = z.infer<typeof addImagesSchema>