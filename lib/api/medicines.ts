import { api } from './http'

export type Medicine = {
    id: number
    name: string
    dose?: string
    duration_days?: number
    frequency?: string
    recommended_brands?: string
    description?: string
    manufacturer?: string
    price: number
    stock: number
}

export async function listMedicines(params?: { limit?: number; offset?: number }): Promise<Medicine[]> {
    const { data } = await api.get<Medicine[]>('/api/v1/medicines', { params })
    return data
}
