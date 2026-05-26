'use client';

/**
 * Prescription Detail / Print Page
 *
 * Fixes from original:
 * ✅ useEffect + useState → useQuery (staleTime, retry, loading states)
 * ✅ (id as string) unsafe cast → useParams<{ id: string }> with proper guard
 * ✅ key={idx} on table rows → key={med.medicine_id}
 */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { prescriptionsApi, type Prescription } from '@/lib/api/prescriptions';

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: rx, isLoading, isError } = useQuery<Prescription>({
    queryKey: ['prescriptions', id],
    queryFn: ({ signal }) => prescriptionsApi.getById(id, signal),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1_000, // prescriptions rarely change — cache 5 min
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (isError || !rx) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-medium">
        Failed to load prescription. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      {/* Action bar — hidden during print */}
      <div className="no-print w-full max-w-4xl flex justify-end mb-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          aria-label="Print or save as PDF"
        >
          <Printer size={16} aria-hidden="true" />
          Print / Save PDF
        </button>
      </div>

      {/* A4 canvas */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-xl text-black print:shadow-none">
        {/* Header */}
        <header className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-900">VITALCACHE CARE</h1>
            <p className="text-sm text-gray-600 mt-1">123 Health Avenue, Medical District</p>
            <p className="text-sm text-gray-600">Contact: +1 (555) 123-4567</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">Attending Physician</h2>
            <p className="text-sm font-semibold text-gray-600">MD, General Physician</p>
          </div>
        </header>

        {/* Patient details */}
        <section className="flex justify-between text-sm mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
          <div>
            <p>
              <span className="font-semibold text-gray-700">Patient ID:</span>{' '}
              {rx.patient_id.substring(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold text-gray-700">Date:</span>{' '}
              {new Date(rx.created_at).toLocaleDateString()}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-gray-700">Rx ID:</span>{' '}
              {rx.prescription_id.split('-')[0]?.toUpperCase()}
            </p>
          </div>
        </section>

        {/* Rx symbol */}
        <div className="text-4xl font-serif font-bold text-gray-800 mb-6" aria-label="Prescription">Rx</div>

        {/* Medications table */}
        <section className="mb-12 min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="py-2 font-semibold w-1/2">Medicine</th>
                <th className="py-2 font-semibold">Dosage</th>
                <th className="py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {rx.medications.map((med) => (
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

        {/* Clinical notes */}
        {rx.notes && (
          <section className="mb-12">
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">
              Clinical Notes &amp; Advice
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{rx.notes}</p>
          </section>
        )}

        {/* Signature */}
        <footer className="mt-auto pt-20 flex justify-end">
          <div className="text-center">
            <div className="border-b border-gray-800 w-48 mb-2" />
            <p className="text-sm font-bold text-gray-800">Doctor&apos;s Signature</p>
          </div>
        </footer>
      </div>
    </div>
  );
}