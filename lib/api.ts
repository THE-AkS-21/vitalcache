import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach access token ───────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('vc_access_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers['Authorization'] = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post<{ data: { access_token: string } }>(
        '/api/auth/refresh',
        {}
      );
      const newToken = data.data.access_token;
      sessionStorage.setItem('vc_access_token', newToken);
      processQueue(null, newToken);
      original.headers['Authorization'] = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      sessionStorage.removeItem('vc_access_token');
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Typed API helpers
// ─────────────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PagedResponse<T> {
  success: boolean;
  data: T[];
  meta: { limit: number; offset: number; total: number };
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ access_token: string; role: string }>>('/api/auth/login', { email, password }),
  register: (email: string, password: string, role: string) =>
    api.post<ApiResponse<{ access_token: string }>>('/api/auth/register', { email, password, role }),
  logout: () => api.post('/api/auth/logout'),
  refresh: () => api.post<ApiResponse<{ access_token: string }>>('/api/auth/refresh'),
};

// Patients
export type Patient = {
  id: number; doctor_id: number; name: string; phone: string;
  gender: string; date_of_birth?: string; address?: string;
  blood_group?: string; allergies?: string[];
  created_at: string; updated_at: string;
};

export const patientsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<PagedResponse<Patient>>('/api/v1/patients', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Patient>>(`/api/v1/patients/${id}`),
  create: (data: Partial<Patient>) =>
    api.post<ApiResponse<Patient>>('/api/v1/patients', data, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    }),
  update: (id: number, data: Partial<Patient>) =>
    api.patch<ApiResponse<Patient>>(`/api/v1/patients/${id}`, data),
  search: (phone: string) =>
    api.get<PagedResponse<Patient>>('/api/v1/patients/search', { params: { phone } }),
};

// Prescriptions
export type MedicineItem = {
  name: string; dosage: string; frequency: string;
  duration: string; instructions: string; quantity: number;
};
export type Prescription = {
  id: string; doctor_id: number; patient_id: number;
  medicines: MedicineItem[]; diagnosis: string; notes: string;
  follow_up_date?: string; created_at: string; updated_at: string;
};

export const prescriptionsApi = {
  getById: (id: string) =>
    api.get<ApiResponse<Prescription>>(`/api/v1/prescriptions/${id}`),
  listByPatient: (patientId: number, params?: { limit?: number; offset?: number }) =>
    api.get<PagedResponse<Prescription>>('/api/v1/prescriptions', {
      params: { patient_id: patientId, ...params },
    }),
  create: (data: Omit<Prescription, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>) =>
    api.post<ApiResponse<Prescription>>('/api/v1/prescriptions', data, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    }),
};

// Appointments
export type Appointment = {
  id: number; doctor_id: number; patient_id: number;
  scheduled_at: string; status: string; notes?: string;
  created_at: string; updated_at: string;
};

export const appointmentsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<PagedResponse<Appointment>>('/api/v1/appointments', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Appointment>>(`/api/v1/appointments/${id}`),
  create: (data: { patient_id: number; scheduled_at: string; notes?: string }) =>
    api.post<ApiResponse<Appointment>>('/api/v1/appointments', data, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    }),
  updateStatus: (id: number, status: string, notes?: string) =>
    api.patch<ApiResponse<Appointment>>(`/api/v1/appointments/${id}/status`, { status, notes }),
};

// Medicines
export type Medicine = {
  id: string; name: string; generic_name: string; category: string;
  manufacturer: string; form: string; strength: string;
  description: string; side_effects?: string[];
};

export const medicinesApi = {
  list: (q?: string, params?: { limit?: number; offset?: number }) =>
    api.get<PagedResponse<Medicine>>('/api/v1/medicines', { params: { q, ...params } }),
  getById: (id: string) =>
    api.get<ApiResponse<Medicine>>(`/api/v1/medicines/${id}`),
};

// Doctors
export type Doctor = {
  id: number; user_id: number; name: string;
  designation: string; specialisation: string;
  registration_number?: string; hospital_id?: number; created_at: string;
};

export const doctorsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<PagedResponse<Doctor>>('/api/v1/doctors', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Doctor>>(`/api/v1/doctors/${id}`),
  me: () => api.get<ApiResponse<Doctor>>('/api/v1/profiles/me'),
};
