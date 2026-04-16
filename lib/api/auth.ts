import { api } from './http';

export type UserProfile = {
  user_id: string; // UUID
  role: string;
  designation: string;
  permissions: string[];
  doctor_id?: string;
  patient_id?: string;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data; // Returns TokenPair { access_token, refresh_token }
  },

  register: async (payload: {
    email: string; password: string; first_name: string; last_name: string;
    phone_number?: string; role: string; designation?: string;
  }) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  logout: async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    await api.post('/auth/logout', { refreshToken });
    useAuthStore.getState().logout();
  }
};