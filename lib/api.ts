// lib/api.ts
// ── Unified API client (root-level) ──
// This is the primary API client used by app-level pages and components.
// lib/api/http.ts is used by the modular API helpers under lib/api/*.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { queryClient } from '@/components/shell/query-provider';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  // 🔥 Always include credentials so the browser sends the HttpOnly refresh cookie
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach in-memory access token ────────────────────────
api.interceptors.request.use((config) => {
  // ✅ Access token lives ONLY in Zustand (in-memory). Never sessionStorage/localStorage.
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent cookie-based refresh on 401 ─────────────────
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
      // 🔥 Empty body — browser sends HttpOnly refresh cookie automatically via withCredentials
      const { data } = await axios.post<{ data: { access_token: string } }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken = data.data.access_token;

      // ✅ Store new access token only in Zustand memory
      useAuthStore.getState().setAccessToken(newToken);
      processQueue(null, newToken);

      original.headers['Authorization'] = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      // 🔐 PHI eviction: clear ALL React Query cache before redirecting to login.
      // This eliminates the shared-terminal leak where a new user could see the
      // previous session's patient/prescription data during the 5-min gcTime window.
      queryClient?.clear();
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/login';
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
  /**
   * Login — server sets the HttpOnly refresh_token cookie.
   * Frontend receives only access_token in JSON body.
   * ❌ NO refresh token ever exposed to JavaScript.
   */
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ access_token: string; role: string }>>('/auth/login', { email, password }),

  register: (data: any) =>
    api.post<ApiResponse<void>>('/auth/register', data),

  generateInvite: (data: { email: string; role: string; designation?: string }) =>
    api.post<ApiResponse<{ invite_token: string }>>('/auth/invites', data),

  acceptInvite: (data: any) =>
    api.post<ApiResponse<void>>('/auth/invites/accept', data),

  /**
   * Logout — server clears the HttpOnly cookie via Set-Cookie.
   * ❌ NO refresh token sent in request body.
   */
  logout: () => api.post('/auth/logout'),

  refresh: () => api.post<ApiResponse<{ access_token: string }>>('/auth/refresh'),
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
    api.get<PagedResponse<Patient>>('/patients', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Patient>>(`/patients/${id}`),
  create: (data: Partial<Patient>) =>
    api.post<ApiResponse<Patient>>('/patients', data, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    }),
  update: (id: number, data: Partial<Patient>) =>
    api.patch<ApiResponse<Patient>>(`/patients/${id}`, data),
  search: (phone: string) =>
    api.get<PagedResponse<Patient>>('/patients/search', { params: { phone } }),
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
    api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`),
  listByPatient: (patientId: number, params?: { limit?: number; offset?: number }) =>
    api.get<PagedResponse<Prescription>>('/prescriptions', {
      params: { patient_id: patientId, ...params },
    }),
  create: (data: Omit<Prescription, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>) =>
    api.post<ApiResponse<Prescription>>('/prescriptions', data, {
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
    api.get<PagedResponse<Appointment>>('/appointments', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Appointment>>(`/appointments/${id}`),
  create: (data: { patient_id: number; scheduled_at: string; notes?: string }) =>
    api.post<ApiResponse<Appointment>>('/appointments', data, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    }),
  updateStatus: (id: number, status: string, notes?: string) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status, notes }),
};

// Medicines
export type Medicine = {
  id: string; name: string; generic_name: string; category: string;
  manufacturer: string; form: string; strength: string;
  description: string; side_effects?: string[];
};

export const medicinesApi = {
  list: (q?: string, params?: { limit?: number; offset?: number }) =>
    api.get<PagedResponse<Medicine>>('/medicines', { params: { q, ...params } }),
  getById: (id: string) =>
    api.get<ApiResponse<Medicine>>(`/medicines/${id}`),
};

// Doctors
export type Doctor = {
  id: number; user_id: number; name: string;
  designation: string; specialisation: string;
  registration_number?: string; hospital_id?: number; created_at: string;
};

export const doctorsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<PagedResponse<Doctor>>('/doctors', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Doctor>>(`/doctors/${id}`),
  me: () => api.get<ApiResponse<Doctor>>('/profiles/me'),
};
