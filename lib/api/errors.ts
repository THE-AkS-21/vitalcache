/**
 * API Error Types
 * Matches VitalCache server error responses
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string,
        public details?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export interface ServerErrorResponse {
    error: {
        message: string
        code?: string
        details?: unknown
    }
}

/**
 * Parse error from axios response
 */
export function parseApiError(error: unknown): ApiError {
    const axiosErr = error as { response?: { status?: number; data?: ServerErrorResponse }; message?: string; code?: string } | null
    const status = axiosErr?.response?.status ?? 500
    const data = axiosErr?.response?.data

    if (data?.error) {
        return new ApiError(
            data.error.message || 'An error occurred',
            status,
            data.error.code,
            data.error.details
        )
    }

    // Network error
    if (axiosErr?.message === 'Network Error') {
        return new ApiError('Unable to connect to server', 0, 'NETWORK_ERROR')
    }

    // Timeout
    if (axiosErr?.code === 'ECONNABORTED') {
        return new ApiError('Request timeout', 0, 'TIMEOUT')
    }

    return new ApiError(axiosErr?.message || 'An unexpected error occurred', status)
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: ApiError): string {
    switch (error.code) {
        case 'NETWORK_ERROR':
            return 'Unable to connect. Please check your internet connection.'
        case 'TIMEOUT':
            return 'Request timed out. Please try again.'
        case 'INVALID_CREDENTIALS':
            return 'Invalid email or password.'
        case 'UNAUTHORIZED':
            return 'Session expired. Please log in again.'
        default:
            return error.message || 'Something went wrong. Please try again.'
    }
}
