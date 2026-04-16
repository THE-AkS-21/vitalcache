import { api } from './http';

export type Patient = {
  id: string; // UUID (Patient ID)
  user_id: string; // UUID (User ID)
  first_name: string;
  last_name: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  created_at: string;
};

export const patientsApi = {
  list: async (limit = 20, offset = 0) => {
    // Backend automatically infers doctor_id from JWT
    const { data } = await api.get('/patients/', { params: { limit, offset } });
    return data as { data: Patient[]; total: number };
  }
};