/**
 * API Error Types
 * Matches VitalCache server error responses
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string,
        public details?: any
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export interface ServerErrorResponse {
    error: {
        message: string
        code?: string
        details?: any
    }
}

/**
 * Parse error from axios response
 */
export function parseApiError(error: any): ApiError {
    const status = error?.response?.status || 500
    const data = error?.response?.data as ServerErrorResponse | undefined

    if (data?.error) {
        return new ApiError(
            data.error.message || 'An error occurred',
            status,
            data.error.code,
            data.error.details
        )
    }

    // Network error
    if (error?.message === 'Network Error') {
        return new ApiError('Unable to connect to server', 0, 'NETWORK_ERROR')
    }

    // Timeout
    if (error?.code === 'ECONNABORTED') {
        return new ApiError('Request timeout', 0, 'TIMEOUT')
    }

    return new ApiError(error?.message || 'An unexpected error occurred', status)
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
