import apiClient from './api.client';

export interface Billing {
    id: string;
    patient_id: string;
    patient_name: string;
    doctor_id: string;
    doctor_name: string;
    medical_report_id?: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    created_at: string;
    updated_at: string;
}

export interface PaginatedBillings {
    data: Billing[];
    meta: {
        limit: number;
        offset: number;
        total: number;
    };
}

export interface Analytics {
    today_earnings: number;
    today_patients: number;
    weekly_earnings: number;
    weekly_patients: number;
    monthly_earnings: number;
    monthly_patients: number;
    yearly_earnings: number;
    yearly_patients: number;
}

export interface DailyStat {
    date: string;
    count: number;
}

export interface HeatmapData {
    data: DailyStat[];
}

export const billingsService = {
    async list(limit = 10, offset = 0, doctor_id?: string, patient_id?: string): Promise<PaginatedBillings> {
        const params: any = { limit, offset };
        if (doctor_id) params.doctor_id = doctor_id;
        if (patient_id) params.patient_id = patient_id;
        const res = await apiClient.get('/api/v1/billings', { params });
        return res.data;
    },

    async create(data: { patient_id: string; doctor_id: string; medical_report_id?: string; amount: number; status?: string }): Promise<Billing> {
        const res = await apiClient.post('/api/v1/billings', data);
        return res.data;
    },

    async updateStatus(id: string, status: string): Promise<void> {
        await apiClient.put(`/api/v1/billings/${id}/status`, { status });
    },

    async getAnalytics(): Promise<Analytics> {
        const res = await apiClient.get('/api/v1/billings/analytics');
        return res.data;
    },

    async getHeatmap(): Promise<HeatmapData> {
        const res = await apiClient.get('/api/v1/billings/heatmap');
        return res.data;
    }
};
