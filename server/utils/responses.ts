import type { ZodError } from "zod"

const statusMessageMap = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error'
}

/**
 * A wrapper for Nitro's createError to standardize error responses
 * for more predictable handling on the client side.
 * @param options - The error options including statusCode, message, and optional data
 * @params options.statusCode - The HTTP status code for the error
 * @params options.message - A descriptive message for the error
 * @params options.issues - Optional issues from zod schema validation
 * @params options.error - Optional unknown error
 * @throws An error with the specified status code, message, and data
 */
export const createErrorResponse = (options: {
  /** The HTTP status code for the error */
  statusCode: keyof typeof statusMessageMap,
  /** A message explaining what went wring */
  message: string,
  /** Issues from zod schema validation */
  issues?: ZodError['issues']
  /** Unknown error */
  error?: unknown
  /** Additional data relevant to the error message */
  data?: unknown
}): never => {

  let data
  if (options.issues) {
    data = {
      'x-ai-remarks': 'These issues were found during zod schema validation. Check the issues property for more details.',
      issues: options.issues
    }
  }
  else if (options.error) {
    data = {
      'x-ai-remarks': 'This is an unknown error. Check the error property for more details.',
      error: options.error
    }
  } else if (options.data) {
    data = {
      'x-ai-remarks': 'Additional data relevant to the error message.',
      data: options.data
    }
  }

  throw createError({
    statusCode: options.statusCode,
    statusMessage: statusMessageMap[options.statusCode],
    message: options.message,
    data
  })
}

/**
 * A standardized success response format, for more predictable handling on the client side.
 * @param data - The data to be included in the success response
 * @param message - An optional message describing the success
 * @returns An object containing success status, message, and data of the specified type
 */
export const createSuccessResponse = <T>(data: T, message = 'Request was successful') => {
  return {
    success: true,
    message,
    data
  }
}