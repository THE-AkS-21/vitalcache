import { api } from './http';

export type AppointmentStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED';

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  appointment_time: string;
  status: AppointmentStatus;
  created_at: string;
};

export const appointmentsApi = {
  list: async (limit = 20, offset = 0, signal?: AbortSignal) => {
    const { data } = await api.get<{ data: Appointment[]; total: number }>('/appointments/', {
      params: { limit, offset },
      signal,
    });
    return data as { data: Appointment[]; total: number };
  },

  // Mutations omit signal
  create: async (payload: {
    patient_id: string;
    hospital_id: string;
    appointment_time: string;
  }): Promise<Appointment> => {
    const { data } = await api.post<Appointment>('/appointments/', payload);
    return data;
  },

  updateStatus: async (id: string, status: AppointmentStatus): Promise<Appointment> => {
    const { data } = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
    return data;
  },
};