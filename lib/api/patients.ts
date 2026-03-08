import { api } from './http'

export type Patient = {
  id: number; name: string; age: number; sex?: string;
  mobile_number: string; doctor_id: number; created_at: string; updated_at: string;
}

export type CreatePatientInput = {
  name: string; age: number; sex?: string; mobile_number: string; email?: string;
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const { data } = await api.post('/api/v1/patients', input)
  return data
}

export async function searchPatients(mobile: string): Promise<Patient[]> {
  const { data } = await api.get('/api/v1/patients/search', { params: { mobile } })
  return data
}

export async function getPatient(id: number): Promise<Patient> {
  const { data } = await api.get(`/api/v1/patients/${id}`)
  return data
}

export async function updatePatient(id: number, input: Partial<CreatePatientInput>): Promise<Patient> {
  const { data } = await api.patch(`/api/v1/patients/${id}`, input)
  return data
}

export async function getPrescriptionHistory(id: number, q: { start?: string; end?: string; limit?: number; offset?: number }) {
  const { data } = await api.get(`/api/v1/patients/${id}/prescriptions`, { params: q })
  return data as { patient_id: number; count: number; items: Array<{ id: number; file_url: string; sent_at: string }> }
}
