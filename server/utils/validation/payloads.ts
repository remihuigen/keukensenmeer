import { z } from 'zod'
import { schema } from 'hub:db'

// ---------------------------------------------
// Node / Body schema
// ---------------------------------------------
const TextNodeSchema = z.object({
  text: z.string().min(1).describe('Raw text value inside a paragraph node'),
}).describe('Plain text node')

const ParagraphNodeSchema = z.object({
  type: z.literal('paragraph').describe('Indicates this node is a paragraph'),
  children: z
    .array(TextNodeSchema)
    .min(1)
    .describe('List of text fragments belonging to the paragraph'),
}).describe('Paragraph node within the project body')

const BodyNodeSchema = z
  .union([ParagraphNodeSchema])
  .describe('A single content node in the project body')

// ---------------------------------------------
// Project Image schema (orientation, mime, width, height REMOVED)
// --------------------------------------------export -
export const projectImageCreateSchema = z
  .object({
    pathname: z
      .string()
      .min(1)
      .describe('The Cloudflare R2 pathname of the uploaded image'),

    alt: z
      .string()
      .min(32, 'Alt text should be at least 20 characters long')
      .describe('Accessible alt text for the image, so the GPT model can describe it'),

    position: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Sorting order inside the gallery'),

    isMainImage: z
      .boolean()
      .optional()
      .describe('Marks this image as the primary image of the project. A project can have only one main image.'),
  })
  .describe('Image to associate with the project during creation')

export type ProjectImageCreateSchema = z.infer<typeof projectImageCreateSchema>

// ---------------------------------------------
// Project create schema
// ---------------------------------------------
export const projectCreateSchema = z
  .object({
    title: z.string().min(1).describe('Internal title for the project'),
    publicTitle: z.string().min(4, 'Public title should have a minimum of 4 characters').describe('Public-facing project title shown to visitors'),

    slug: z
      .never()
      .optional()
      .describe('Slug is generated server-side and cannot be provided'),

    status: z.enum(schema.statusEnum).default('draft').describe('Publication status of the project'),

    isFeatured: z.boolean().optional().describe('Whether the project should be highlighted on the homepage'),
    sortingPriority: z
      .number()
      .int()
      .min(0)
      .max(100)
      .optional()
      .describe('Display priority from 0 (highest) to 100 (lowest)'),

    styles: z
      .array(z.enum(schema.styleEnum))
      .min(1)
      .describe('List of design styles that apply to this project'),

    description: z.string().min(60, 'Use at least 60 characters to describe the project').describe('Short project summary'),
    body: z.array(BodyNodeSchema).min(1).describe('The structured content body of the project'),

    images: z
      .array(projectImageCreateSchema)
      .optional()
      .describe('Optional list of images to create alongside the project'),
  })
  .describe('Payload used to create a new project including optional images')


export type ProjectCreateSchema = z.infer<typeof projectCreateSchema>