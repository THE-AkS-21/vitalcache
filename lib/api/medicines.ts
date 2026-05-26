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

export interface PaginatedMedicines {
  data: Medicine[];
  total: number;
}

export const medicinesApi = {
  list: async (params: MedicineListParams = {}, signal?: AbortSignal): Promise<PaginatedMedicines> => {
    const { data } = await api.get<PaginatedMedicines>('/medicines', {
      params: { limit: params.limit ?? 20, offset: params.offset ?? 0, q: params.q },
      signal,
    });
    return data;
  },

  search: async (query: string, limit = 20, offset = 0, signal?: AbortSignal): Promise<PaginatedMedicines> => {
    const { data } = await api.get<PaginatedMedicines>('/medicines/search', {
      params: { q: query, limit, offset },
      signal,
    });
    return data;
  },

  create: async (medicine: { name: string; generic_name?: string; manufacturer?: string; tags?: string[] }): Promise<Medicine> => {
    const { data } = await api.post<Medicine>('/medicines/', medicine);
    return data;
  }
};

export const listMedicines = (params?: MedicineListParams, signal?: AbortSignal) =>
  medicinesApi.list(params, signal);

export const searchMedicines = (query: string, limit?: number, signal?: AbortSignal) =>
  medicinesApi.search(query, limit, signal);