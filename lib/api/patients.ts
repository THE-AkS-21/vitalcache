import { api } from './http';
import type { Prescription } from './prescriptions';

export type Patient = {
  id: string;
  user_id: string;
  name: string;
  first_name: string;
  last_name: string;
  mobile_number?: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  age?: number;
  doctor_id?: string;
  created_at: string;
  updated_at: string;
};

export interface PatientListParams {
  limit?: number;
  offset?: number;
}

export interface CreatePatientPayload {
  name?: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  sex?: string;
  gender?: string;
  mobile_number?: string;
  phone_number?: string;
  email?: string;
}

export const patientsApi = {
  list: async (params: PatientListParams = {}, signal?: AbortSignal): Promise<Patient[]> => {
    const { data } = await api.get<{ data: Patient[]; total: number }>('/patients', {
      params: { limit: params.limit ?? 20, offset: params.offset ?? 0 },
      signal,
    });
    return data.data;
  },

  search: async (mobileNumber: string, signal?: AbortSignal): Promise<Patient[]> => {
    if (!mobileNumber.trim()) {
      return patientsApi.list({ limit: 50 }, signal);
    }
    const { data } = await api.get<{ data: Patient[]; total: number }>('/patients/search', {
      params: { mobile: mobileNumber.trim() },
      signal,
    });
    return data.data;
  },
};

export const searchPatients = (q: string, signal?: AbortSignal) => patientsApi.search(q, signal);
export const listPatients = (params?: PatientListParams, signal?: AbortSignal) => patientsApi.list(params, signal);

export async function getPatient(id: string | number, signal?: AbortSignal): Promise<Patient> {
  const { data } = await api.get<{ data: Patient }>(`/patients/${id}`, { signal });
  return data.data;
}

export async function getPrescriptionHistory(
  patientId: string | number,
  params: { limit?: number; offset?: number } = {},
  signal?: AbortSignal
): Promise<Prescription[]> {
  const { data } = await api.get<{ data: Prescription[]; total: number }>(
    `/prescriptions/patient/${patientId}`,
    { params: { limit: params.limit ?? 20, offset: params.offset ?? 0 }, signal }
  );
  return data.data;
}

export async function createPatient(payload: CreatePatientPayload): Promise<Patient> {
  const { data } = await api.post<{ data: Patient }>('/patients', payload);
  return data.data;
}