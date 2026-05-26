import { api } from './http';
import { Medication } from './prescriptions'; // Reuse Medication type from prescriptions

export interface MedicalReport {
  id: string;
  report_id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  disease_name: string;
  diagnosis_body: string;
  medications: Medication[];
  precautions: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportReq {
  patient_id: string;
  hospital_id: string;
  disease_name: string;
  diagnosis_body?: string;
  medications?: Medication[];
  precautions?: string;
}

export interface ReportListParams {
  limit?: number;
  offset?: number;
}

export const medicalReportsApi = {
  create: async (req: CreateReportReq): Promise<MedicalReport> => {
    const { data } = await api.post<MedicalReport>('/medical-reports/', req);
    return data;
  },

  get: async (id: string, signal?: AbortSignal): Promise<MedicalReport> => {
    const { data } = await api.get<MedicalReport>(`/medical-reports/${id}`, { signal });
    return data;
  },

  listByPatient: async (patientId: string, params: ReportListParams = {}, signal?: AbortSignal): Promise<MedicalReport[]> => {
    const { data } = await api.get<{ data: MedicalReport[]; total: number }>(`/medical-reports/patient/${patientId}`, {
      params: { limit: params.limit ?? 20, offset: params.offset ?? 0 },
      signal,
    });
    return data.data;
  },
};
