// API error type definitions
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  status?: number
}

// User-friendly error message mapping
export const errorMessages: Record<string, string> = {
  // Authentication related errors
  "auth/invalid-credentials": "Email or password is incorrect.",
  "auth/user-not-found": "User not found.",
  "auth/email-already-exists": "Email is already in use.",
  "auth/username-already-exists": "Username is already in use.",
  "auth/weak-password": "Password is too weak. Please include at least 8 characters with letters, numbers, and special characters.",
  "auth/token-expired": "Authentication has expired. Please sign in again.",

  // Client related errors
  "client/not-found": "Client not found.",
  "client/invalid-redirect-uri": "Invalid redirect URI.",
  "client/invalid-scope": "Invalid scope.",
  "client/duplicate-name": "Client name is already in use.",

  // Token related errors
  "token/not-found": "Token not found.",
  "token/already-revoked": "Token has already been revoked.",
  "token/expired": "Token has expired.",

  // General errors
  "server/internal-error": "A server error occurred. Please try again later.",
  "network/connection-error": "A network connection error occurred. Please check your internet connection.",
  "request/validation-error": "Input data is invalid.",
  "request/rate-limit": "Too many requests. Please try again later.",

  // Default error
  default: "An error occurred. Please try again later.",
}

// Error code extraction function
export function getErrorCode(error: any): string {
  if (error?.response?.data?.code) {
    return error.response.data.code
  }

  if (error?.code) {
    return error.code
  }

  if (error?.response?.status === 401) {
    return "auth/token-expired"
  }

  if (error?.response?.status === 404) {
    return "request/not-found"
  }

  if (error?.response?.status === 422) {
    return "request/validation-error"
  }

  if (error?.response?.status === 429) {
    return "request/rate-limit"
  }

  if (error?.message?.includes("Network Error")) {
    return "network/connection-error"
  }

  return "default"
}

// Get user-friendly error message
export function getErrorMessage(error: any): string {
  const code = getErrorCode(error)
  return errorMessages[code] || errorMessages.default
}

// API error object creation function
export function createApiError(
  code: string,
  message: string,
  details?: Record<string, any>,
  status?: number,
): ApiError {
  return {
    code,
    message,
    details,
    status,
  }
}
