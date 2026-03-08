import { api } from './http'
import { parseApiError, getUserFriendlyError } from './errors'
import { tokenStore } from '../auth/token-store'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  role: string // Generic string to match server/profile
  user: UserProfile
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  role: 'doctor' | 'developer' | 'hospital_staff' | 'patient'
  designation?: string
}

export type UserProfile = {
  id: number
  role: string
  doctor_id?: number
  email: string
  name?: string
}

/**
 * Login with email and password.
 * Automatically fetches user profile to return role/user info.
 */
export async function login(input: LoginRequest): Promise<LoginResponse> {
  try {
    // 1. Perform Login
    const { data: tokenData } = await api.post<{ accessToken: string }>('/api/auth/login', {
      email: input.email,
      password: input.password,
    })

    // 2. Set Token temporarily to allow the 'me' call to succeed
    tokenStore.set(tokenData.accessToken)

    // 3. Fetch User Profile to get the Role
    const user = await me()

    return {
      accessToken: tokenData.accessToken,
      role: user.role,
      user: user
    }
  } catch (error) {
    tokenStore.clear() // Cleanup on failure
    const apiError = parseApiError(error)
    throw new Error(getUserFriendlyError(apiError))
  }
}

/**
 * Register a new user
 */
export async function register(input: RegisterRequest): Promise<void> {
  try {
    // Register endpoint usually returns 201 Created with no body or success message
    await api.post('/api/auth/register', input)
  } catch (error) {
    const apiError = parseApiError(error)
    throw new Error(getUserFriendlyError(apiError))
  }
}

/**
 * Logout and clear authentication cookies
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout', {})
    tokenStore.clear()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

/**
 * Get current user profile
 */
export async function me(): Promise<UserProfile> {
  try {
    const { data } = await api.get<UserProfile>('/api/v1/profiles/me')
    return data
  } catch (error) {
    const apiError = parseApiError(error)
    throw new Error(getUserFriendlyError(apiError))
  }
}

/**
 * Refresh access token using HTTP-only cookie
 */
export async function refreshToken(): Promise<string> {
  // Returns just the token, let the caller handle profile fetching if needed
  const { data } = await api.post<{ accessToken: string }>('/api/auth/refresh', {})
  return data.accessToken
}
