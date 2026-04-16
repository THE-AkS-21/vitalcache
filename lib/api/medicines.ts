import { api } from './http';

export type Medicine = {
    id: string;
    name: string;
    type: string;
    dosage_options: string[];
    frequency_suggestions: string[];
    recommended_brands: string[];
};

export const medicinesApi = {
    search: async (query: string, limit = 50) => {
        const { data } = await api.get('/medicines/search', { params: { q: query, limit } });
        return data as { data: Medicine[]; total: number };
    }
};