'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { medicalReportsApi } from '@/lib/api/medical_reports';
import { reportsApi } from '@/lib/api/reports';
import { useAuthStore } from '@/store/authStore';

export default function MedicalReportPrintPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const { data: report, isLoading: loadingReport, isError: isReportError } = useQuery({
    queryKey: ['medical-reports', id],
    queryFn: ({ signal }) => medicalReportsApi.get(id, signal),
    enabled: Boolean(id),
  });

  const { data: format, isLoading: loadingFormat } = useQuery({
    queryKey: ['report-format'],
    queryFn: ({ signal }) => reportsApi.getFormat(signal),
  });

  if (loadingReport || loadingFormat) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading medical report...</p>
        </div>
      </div>
    );
  }

  if (isReportError || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-medium">
        Failed to load medical report. Please try again.
      </div>
    );
  }

  const doctorName = user ? `Dr. ${user.first_name} ${user.last_name}` : 'Attending Physician';
  const headerText = format?.header_text || 'VITALCACHE CARE';
  const addressText = format?.address_text || '123 Health Avenue, Medical District\nContact: +1 (555) 123-4567';
  const footerText = format?.footer_text || '';

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="no-print w-full max-w-4xl flex justify-end mb-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-xl text-black print:shadow-none flex flex-col">
        {/* Header */}
        <header className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-indigo-900 uppercase">{headerText}</h1>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{addressText}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">{doctorName}</h2>
            <p className="text-sm font-semibold text-gray-600">{user?.designation || 'Medical Professional'}</p>
          </div>
        </header>

        {/* Patient Details */}
        <section className="flex justify-between text-sm mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
          <div>
            <p><span className="font-semibold text-gray-700">Patient ID:</span> {report.patient_id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold text-gray-700">Date:</span> {new Date(report.created_at).toLocaleDateString()}</p>
            <p className="mt-1"><span className="font-semibold text-gray-700">Report ID:</span> {report.report_id}</p>
          </div>
        </section>

        {/* Diagnosis */}
        <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">Diagnosis</h3>
            <p className="text-xl font-bold text-indigo-900 mb-2">{report.disease_name}</p>
            {report.diagnosis_body && (
                <p className="text-gray-700 whitespace-pre-wrap">{report.diagnosis_body}</p>
            )}
        </section>

        <div className="text-4xl font-serif font-bold text-gray-800 mb-6">Rx</div>

        {/* Medications Table */}
        <section className="mb-12 min-h-[200px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="py-2 font-semibold w-1/2">Medicine</th>
                <th className="py-2 font-semibold">Dosage</th>
                <th className="py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {report.medications?.map((med) => (
                <tr key={med.medicine_id} className="border-b border-dashed border-gray-200">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-gray-900 text-lg">{med.name}</p>
                    <p className="text-sm text-gray-600 italic mt-1">{med.instructions}</p>
                  </td>
                  <td className="py-4 align-top">
                    <p className="font-semibold text-gray-800">{med.dosage}</p>
                    <p className="text-sm text-gray-500">{med.frequency}</p>
                  </td>
                  <td className="py-4 align-top">
                    <p className="font-semibold text-gray-800">{med.duration_days} Days</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Precautions */}
        {report.precautions && (
          <section className="mb-12">
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">Precautions & Follow-up</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.precautions}</p>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-auto flex justify-between items-end">
            <div className="text-xs text-gray-500 max-w-sm whitespace-pre-wrap">
                {footerText}
            </div>
            <div className="text-center">
                <div className="border-b border-gray-800 w-48 mb-2" />
                <p className="text-sm font-bold text-gray-800">Doctor&apos;s Signature</p>
            </div>
        </footer>
      </div>
    </div>
  );
}
