import { api } from './http';

export interface ReportFormat {
  hospital_id: string;
  header_text: string;
  address_text: string;
  footer_text: string;
  logo_url: string;
}

export type UpdateFormatReq = Omit<ReportFormat, 'hospital_id'>;

export const reportsApi = {
  getFormat: async (signal?: AbortSignal): Promise<ReportFormat> => {
    const { data } = await api.get<{ data: ReportFormat }>('/reports/format', { signal });
    return data.data;
  },

  updateFormat: async (req: UpdateFormatReq): Promise<ReportFormat> => {
    const { data } = await api.put<{ data: ReportFormat }>('/reports/format', req);
    return data.data;
  },
};
