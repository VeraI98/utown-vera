import axios from 'axios'

/**
 * Extracts a user-facing message from an API error response, falling back
 * to a caller-supplied default when the response carries no message of its
 * own (network failure, non-JSON body, etc).
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
  statusMessages: Partial<Record<number, string>> = {},
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message
    }

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData
    }
    const status = error.response?.status
    if (status && statusMessages[status]) return statusMessages[status]
  }

  if (!axios.isAxiosError(error) && error instanceof Error && error.message)
    return error.message
  return fallback
}
