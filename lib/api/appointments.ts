import { api } from './http';

export type AppointmentStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED';

export type Appointment = {
    id: string; // UUID
    patient_id: string;
    doctor_id: string;
    hospital_id: string;
    appointment_time: string; // ISO String
    status: AppointmentStatus;
    created_at: string;
};

export const appointmentsApi = {
    list: async (limit = 20, offset = 0) => {
        const { data } = await api.get('/appointments/', { params: { limit, offset } });
        return data as { data: Appointment[]; total: number };
    },

    create: async (payload: { patient_id: string; hospital_id: string; appointment_time: string }) => {
        const { data } = await api.post<Appointment>('/appointments/', payload);
        return data;
    },

    updateStatus: async (id: string, status: AppointmentStatus) => {
        const { data } = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
        return data;
    }
};