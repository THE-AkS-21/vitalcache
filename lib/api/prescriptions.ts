import { api } from './http';

export type Medication = {
  medicine_id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  instructions: string;
};

export type Prescription = {
  id: string;
  prescription_id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  disease_name?: string;
  medications: Medication[];
  notes: string;
  status: string;
  created_at: string;
  updated_at?: string;
};

export interface PrescriptionListParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedPrescriptions {
  data: Prescription[];
  total: number;
}

export const prescriptionsApi = {
  list: async (params: PrescriptionListParams = {}, signal?: AbortSignal): Promise<PaginatedPrescriptions> => {
    const { data } = await api.get<PaginatedPrescriptions>(
      '/prescriptions', {
      params: { limit: params.limit ?? 20, offset: params.offset ?? 0 },
      signal,
    });
    return data;
  },

  getPatientHistory: async (
    patientId: string,
    limit = 20,
    offset = 0,
    signal?: AbortSignal
  ): Promise<PaginatedPrescriptions> => {
    const { data } = await api.get<PaginatedPrescriptions>(
      `/prescriptions/patient/${patientId}`,
      { params: { limit, offset }, signal }
    );
    return data;
  },

  // Mutations intentionally omit signal — aborting POST mid-flight causes partial writes
  create: async (payload: {
    patient_id: string;
    hospital_id: string;
    medications: Medication[];
    notes?: string;
  }): Promise<Prescription> => {
    const { data } = await api.post<Prescription>('/prescriptions/', payload);
    return data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<Prescription> => {
    const { data } = await api.get<Prescription>(`/prescriptions/${id}`, { signal });
    return data;
  },
};

export const listPrescriptions = (params?: PrescriptionListParams, signal?: AbortSignal) =>
  prescriptionsApi.list(params, signal);

export const getPrescriptionsByPatient = (patientId: string, signal?: AbortSignal) =>
  prescriptionsApi.getPatientHistory(patientId, 20, 0, signal);