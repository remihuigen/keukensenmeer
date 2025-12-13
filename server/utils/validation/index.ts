import type { z } from 'zod'
import type { H3Event } from 'h3'

/**
 * Validate query parameters against a Zod schema. Alternative to using getValidatedQuery from h3,
 * with better structured error output.
 * @param event - The H3 event
 * @param schema - The Zod schema to validate against
 * @returns The validated query parameters
 * @throws 400 error if validation fails
 */
export function validateZodQuerySchema<T>(event: H3Event, schema: z.ZodType<T>): T {
    const query = getQuery(event)

    const { data, success, error } = schema.safeParse(query)

    if (!success) {
        createErrorResponse({
            statusCode: 400,
            message: 'The provided query parameters are invalid.',
            issues: error.issues
        })
    }

    return data
}

/**
 * Validate body parameters against a Zod schema. Alternative to using getValidatedBody from h3,
 * with better structured error output.
 * @param event - The H3 event
 * @param schema - The Zod schema to validate against
 * @returns The validated body parameters
 * @throws 400 error if validation fails
 */
export async function validateZodBodySchema<T>(event: H3Event, schema: z.ZodType<T>): Promise<T> {
    const body = await readBody(event)

    const { data, success, error } = schema.safeParse(body)

    if (!success) {
        createErrorResponse({
            statusCode: 400,
            message: 'The provided body parameters are invalid.',
            issues: error.issues
        })
    }

    return data
}
