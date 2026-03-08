import { api } from './http'

export type Prescription = {
    id: number
    patient_id: number
    doctor_id: number
    notes: string
    file_url: string
    created_at: string
}

export type CreatePrescriptionInput = {
    patient_id: number
    notes: string
    medicines: {
        medicine_id: number
        dose: string
        duration: string
        frequency: string
    }[]
}

export async function createPrescription(input: CreatePrescriptionInput): Promise<Prescription> {
    const { data } = await api.post<Prescription>('/api/v1/prescriptions', input)
    return data
}

export async function getPrescriptionHistory(
    patientId: number,
    params: { start?: string; end?: string; limit?: number; offset?: number }
): Promise<{ patient_id: number; count: number; items: Prescription[] }> {
    const { data } = await api.get<{ patient_id: number; count: number; items: Prescription[] }>(`/api/v1/patients/${patientId}/prescriptions`, { params })
    return data
}

export async function getPrescription(id: number): Promise<Prescription & { items: any[] }> {
    const { data } = await api.get<Prescription & { items: any[] }>(`/api/v1/prescriptions/${id}`)
    return data
}

export async function listPrescriptions(params?: { limit?: number; offset?: number }): Promise<Prescription[]> {
    const { data } = await api.get<Prescription[]>('/api/v1/prescriptions', { params })
    return data
}
