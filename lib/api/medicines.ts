import { api } from './http';

export type Medicine = {
  id: string;
  name: string;
  type: string;
  dose?: string;
  frequency?: string;
  recommended_brands?: string;
  price?: number;
  stock?: number;
  dosage_options: string[];
  frequency_suggestions: string[];
};

export interface MedicineListParams {
  limit?: number;
  offset?: number;
  q?: string;
}

export const medicinesApi = {
  list: async (params: MedicineListParams = {}, signal?: AbortSignal): Promise<Medicine[]> => {
    const { data } = await api.get<{ data: Medicine[]; total: number }>('/medicines/', {
      params: { limit: params.limit ?? 50, offset: params.offset ?? 0, q: params.q },
      signal,
    });
    return data.data;
  },

  search: async (query: string, limit = 50, signal?: AbortSignal): Promise<Medicine[]> => {
    const { data } = await api.get<{ data: Medicine[]; total: number }>('/medicines/search', {
      params: { q: query, limit },
      signal,
    });
    return data.data;
  },
};

export const listMedicines = (params?: MedicineListParams, signal?: AbortSignal) =>
  medicinesApi.list(params, signal);

export const searchMedicines = (query: string, limit?: number, signal?: AbortSignal) =>
  medicinesApi.search(query, limit, signal);