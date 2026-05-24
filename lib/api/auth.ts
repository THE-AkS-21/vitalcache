import { api } from './http';

export type UserProfile = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  designation?: string;
  permissions: string[];
  doctor_id?: string;
  patient_id?: string;
};

export const authApi = {
  /**
   * Login — backend sets the HttpOnly refresh_token cookie automatically.
   * Frontend receives only the access_token + user profile in the JSON body.
   */
  login: async (email: string, password: string) => {
    const { data } = await api.post<{
      data: { access_token: string; user?: UserProfile };
    }>('/auth/login', { email, password });
    return data.data; // { access_token, user }
  },

  register: async (payload: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role: string;
    designation?: string;
  }) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  /**
   * Logout — backend clears the HttpOnly cookie via Set-Cookie header.
   * Frontend clears in-memory access token via Zustand (handled by caller).
   * ❌ NO refresh token is sent in the request body.
   */
  logout: async () => {
    // withCredentials is already set on the `api` instance — cookie is sent automatically
    await api.post('/auth/logout');
  },
};