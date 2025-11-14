import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import type { ZodSchema } from 'zod'

export const readValidatedBody = async <T>(
	event: H3Event,
	schema: ZodSchema<T>,
): Promise<T> => {
	const payload = await readBody<unknown>(event)
	const result = schema.safeParse(payload)

	if (!result.success) {
		throw createError({
			statusCode: 422,
			statusMessage: 'Invalid request payload',
			data: result.error.flatten(),
		})
	}

	return result.data
}
