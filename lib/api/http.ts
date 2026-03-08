import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from '../auth/token-store'

const isProduction = process.env.NODE_ENV === 'production'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token and logging
api.interceptors.request.use(
  (config) => {
    const token = tokenStore.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log requests in development
    if (!isProduction) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    if (!isProduction) {
      console.error('[API] Request error:', error)
    }
    return Promise.reject(error)
  }
)

// Token refresh state
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

// Response interceptor - handle token refresh and logging
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (!isProduction) {
      console.log(`[API] ✓ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // Log errors in development
    if (!isProduction) {
      console.error(`[API] ✗ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status,
        error: error.response?.data,
      })
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true
        originalRequest._retry = true

        try {
          // Call refresh endpoint (uses HTTP-only cookie)
          const response = await api.post('/api/auth/refresh', {})
          const newToken = response.data.accessToken

          // Update stored token
          tokenStore.set(newToken)

          // Resolve all queued requests with new token
          refreshQueue.forEach((callback) => callback(newToken))
          refreshQueue = []

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api.request(originalRequest)
        } catch (refreshError) {
          // Refresh failed - clear token and redirect to login
          tokenStore.clear()
          refreshQueue = []

          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // Queue the request while refresh is in progress
      return new Promise((resolve, reject) => {
        refreshQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          api.request(originalRequest).then(resolve).catch(reject)
        })
      })
    }

    return Promise.reject(error)
  }
)

// Retry logic for network errors
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number }

  // Only retry network errors, not 4xx/5xx
  if (!error.response && config) {
    config._retryCount = config._retryCount || 0

    if (config._retryCount < 2) {
      config._retryCount += 1

      if (!isProduction) {
        console.log(`[API] Retrying request (${config._retryCount}/2):`, config.url)
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, (config._retryCount || 1) * 1000))
      return api.request(config)
    }
  }

  return Promise.reject(error)
})
