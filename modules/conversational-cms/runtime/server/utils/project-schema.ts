import { createError } from 'h3'
import { z } from 'zod'
import type { ProjectInput } from '~~/shared/types/project'

const ParagraphNodeSchema = z.object({
	type: z.literal('paragraph'),
	children: z.array(
		z.object({
			text: z.string(),
		}),
	),
})

const ImageObjectSchema = z.object({
	url: z.string().url(),
	orientation: z.enum(['landscape', 'portrait', 'square']).optional(),
	alt: z.string().optional(),
})

export const ProjectInputSchema = z
	.object({
		title: z.string().min(1),
		publicTitle: z.string().min(1),
		status: z.enum(['draft', 'published', 'archived']).optional(),
		isFeatured: z.boolean().optional(),
		sortingPriority: z.number().int().optional(),
		styles: z.array(z.enum(['robuust', 'modern', 'landelijk', 'klassiek'])).min(1),
		mainImage: z.string().url(),
		description: z.string().min(1),
		body: z.array(ParagraphNodeSchema),
		images: z.array(z.union([z.string().url(), ImageObjectSchema])),
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
	})
	.passthrough()

export type ProjectInputPayload = z.infer<typeof ProjectInputSchema> & Record<string, unknown>

export const parseProjectInput = (payload: unknown): ProjectInputPayload => {
	const parsed = ProjectInputSchema.safeParse(payload)

	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid project payload',
			data: parsed.error.flatten(),
		})
	}

	return parsed.data as ProjectInput & Record<string, unknown>
}
