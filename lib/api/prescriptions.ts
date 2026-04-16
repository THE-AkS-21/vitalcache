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
    id: string; // MongoDB ObjectID
    prescription_id: string; // UUID
    patient_id: string; // UUID
    doctor_id: string; // UUID
    hospital_id: string; // UUID
    medications: Medication[];
    notes: string;
    status: string;
    created_at: string;
};

export const prescriptionsApi = {
    getPatientHistory: async (patientId: string, limit = 20, offset = 0) => {
        const { data } = await api.get(`/prescriptions/patient/${patientId}`, { params: { limit, offset } });
        return data as { data: Prescription[]; total: number };
    },

    create: async (payload: { patient_id: string; hospital_id: string; medications: Medication[]; notes?: string }) => {
        const { data } = await api.post<Prescription>('/prescriptions/', payload);
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<Prescription>(`/prescriptions/${id}`);
        return data;
    }
};