'use client';

import { useQuery } from '@tanstack/react-query';
import { getPatient, getPrescriptionHistory } from '@/lib/api/patients';
import type { Patient } from '@/lib/api/patients';
import type { Prescription } from '@/lib/api/prescriptions';
import { useParams } from 'next/navigation';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id; // keep as string — UUID

  const patientQ = useQuery<Patient>({
    queryKey: ['patients', id],
    queryFn: ({ signal }) => getPatient(id, signal),
    enabled: Boolean(id),
  });

  const historyQ = useQuery<Prescription[]>({
    queryKey: ['patients', id, 'prescriptions'],
    queryFn: ({ signal }) => getPrescriptionHistory(id, { limit: 20, offset: 0 }, signal),
    enabled: Boolean(id),
  });

  if (patientQ.isLoading) return <DataTableSkeleton columnCount={2} rowCount={4} />;
  if (patientQ.isError) return (
    <div className="p-6 text-red-600 font-medium">Failed to load patient. Please try again.</div>
  );

  const p = patientQ.data;
  if (!p) return null;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {p.name ?? `${p.first_name} ${p.last_name}`}
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Patient Info */}
        <div className="card p-5 border-none shadow-lg bg-white/50 backdrop-blur-xl space-y-2">
          <h2 className="font-semibold text-gray-700 mb-3">Patient Details</h2>
          <div><span className="text-gray-500 text-sm">Age:</span> <span className="font-medium">{p.age ?? '—'}</span></div>
          <div><span className="text-gray-500 text-sm">Mobile:</span> <span className="font-medium">{p.mobile_number ?? p.phone_number ?? '—'}</span></div>
          <div><span className="text-gray-500 text-sm">Gender:</span> <span className="font-medium">{p.gender ?? '—'}</span></div>
          <div><span className="text-gray-500 text-sm">Last Updated:</span> <span className="font-medium">{new Date(p.updated_at).toLocaleString()}</span></div>
        </div>

        {/* Prescription History */}
        <div className="card p-5 border-none shadow-lg bg-white/50 backdrop-blur-xl">
          <h2 className="font-semibold text-gray-700 mb-3">Prescription History</h2>
          {historyQ.isLoading ? (
            <DataTableSkeleton columnCount={2} rowCount={3} />
          ) : historyQ.data && historyQ.data.length > 0 ? (
            <ul className="space-y-2">
              {historyQ.data.map((rx: Prescription) => (
                <li key={rx.id} className="flex justify-between p-3 border rounded-lg bg-white/80">
                  <span className="font-mono text-sm text-gray-600">#{rx.prescription_id.substring(0, 8)}</span>
                  <span className="text-gray-500 text-sm">{new Date(rx.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No prescriptions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
