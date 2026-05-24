'use client';

/**
 * NewPrescriptionPage
 *
 * Performance / correctness fixes:
 * ✅ ClayCard removed — was a broken import (never existed in @/components/ui/card)
 * ✅ framer-motion removed — AnimatePresence/motion.div replaced with CSS transitions
 * ✅ useEffect patient fetch → useQuery (benefits from QueryProvider staleTime + retry)
 * ✅ err: any → err: unknown + AxiosError type narrowing
 * ✅ patientsApi.list signature fixed (no positional args — uses params object now)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Save, User, Trash2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { MedicineSearch } from '@/components/ui/medicine-search';
import { listPatients, type Patient } from '@/lib/api/patients';
import { prescriptionsApi, type Medication } from '@/lib/api/prescriptions';
import { type Medicine } from '@/lib/api/medicines';
import { useAuthStore } from '@/store/authStore';
import type { AxiosError } from 'axios';

export default function NewPrescriptionPage() {
  const router = useRouter();

  // ── Auth context ─────────────────────────────────────────────────────────────
  // hospital_id is not yet returned by /profiles/me. We use doctor_id as a
  // temporary stand-in. When the backend adds hospital_id to the profile
  // response, replace `doctor_id` with `hospital_id` here and in authStore.
  // TODO(backend): wire hospital_id from GoProfileResponse → authStore → here.
  const doctorId = useAuthStore((s) => s.user?.doctor_id ?? null);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Patient list via React Query — no manual useEffect + setState ────────────
  const { data: patients = [], isLoading: loadingPatients } = useQuery<Patient[]>({
    queryKey: ['patients', 'list'],
    queryFn: ({ signal }) => listPatients({ limit: 100 }, signal),
  });

  // ── Medicine handlers ────────────────────────────────────────────────────────
  const handleAddMedicine = (med: Medicine) => {
    if (medications.some((m) => m.medicine_id === med.id)) return;
    const newMed: Medication = {
      medicine_id: med.id,
      name: med.name,
      dosage: med.dosage_options?.[0] ?? '1 Tablet',
      frequency: med.frequency_suggestions?.[0] ?? 'Twice a day',
      duration_days: 5,
      instructions: 'After food',
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    setMedications((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]!, [field]: value };
      return next;
    });
  };

  const removeMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);
    if (!selectedPatientId) { setError('Please select a patient.'); return; }
    if (medications.length === 0) { setError('Please add at least one medication.'); return; }
    if (!doctorId) {
      setError('Your doctor profile is not loaded. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await prescriptionsApi.create({
        patient_id: selectedPatientId,
        // Temporary: doctorId is used as hospital_id until the backend returns
        // a dedicated hospital_id field in /profiles/me.
        // TODO(backend): replace with user?.hospital_id once available.
        hospital_id: doctorId,
        medications,
        notes,
      });
      router.push(`/prescriptions/${res.id}`);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      setError(axiosErr?.response?.data?.error?.message ?? 'Failed to create prescription.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="text-indigo-500 flex-shrink-0" size={32} aria-hidden="true" />
          Create New Prescription
        </h1>
        <p className="text-gray-500 mt-1">Search medicines, define dosages, and generate a printable record.</p>
      </div>

      {/* Error banner — CSS fade-in, no framer-motion */}
      {error && (
        <div
          className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200 shadow-sm animate-fade-in"
          role="alert"
        >
          <AlertCircle size={20} className="flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Patient + Medicine search ─────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Patient selector */}
          <div className="card p-5 border-none shadow-xl bg-white/50 backdrop-blur-xl space-y-3">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <User size={18} className="text-indigo-500" aria-hidden="true" />
              Select Patient
            </h2>
            {loadingPatients ? (
              <p className="text-sm text-gray-400 animate-pulse">Loading patients...</p>
            ) : (
              <select
                id="patient-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white/80 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                aria-label="Select patient"
              >
                <option value="" disabled>Choose a patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? `${p.first_name} ${p.last_name}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Medicine search */}
          <div className="card p-5 border-none shadow-xl bg-white/50 backdrop-blur-xl space-y-3">
            <h2 className="text-base font-bold text-gray-700">Add Medicine</h2>
            <MedicineSearch onSelect={handleAddMedicine} />
          </div>
        </div>

        {/* ── RIGHT: Medications list + notes ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 border-none shadow-xl bg-white/50 backdrop-blur-xl min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Rx Medications
            </h2>

            {medications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <FileText size={48} className="opacity-40" aria-hidden="true" />
                <p className="font-medium">No medications added yet.</p>
                <p className="text-sm">Use the search bar on the left to add medicines.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                {medications.map((med, idx) => (
                  <div
                    key={`${med.medicine_id}-${idx}`}
                    className="relative bg-white/80 border border-slate-100 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => removeMedication(idx)}
                      className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${med.name}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>

                    <h3 className="font-bold text-indigo-900 mb-3">{med.name}</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(
                        [
                          { field: 'dosage',       label: 'Dosage',          type: 'text',   value: med.dosage       },
                          { field: 'frequency',    label: 'Frequency',       type: 'text',   value: med.frequency    },
                          { field: 'duration_days',label: 'Duration (Days)', type: 'number', value: med.duration_days},
                          { field: 'instructions', label: 'Instructions',    type: 'text',   value: med.instructions },
                        ] as const
                      ).map(({ field, label, type, value }) => (
                        <div key={field}>
                          <label
                            htmlFor={`${med.medicine_id}-${field}`}
                            className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                          >
                            {label}
                          </label>
                          <input
                            id={`${med.medicine_id}-${field}`}
                            type={type}
                            value={value}
                            min={type === 'number' ? 1 : undefined}
                            onChange={(e) =>
                              updateMedication(
                                idx,
                                field,
                                type === 'number' ? (parseInt(e.target.value) || 1) : e.target.value
                              )
                            }
                            className="w-full mt-1 p-1.5 bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none text-sm font-medium text-gray-800 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clinical notes */}
            <div className="mt-6">
              <label htmlFor="rx-notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Clinical Notes &amp; Advice
              </label>
              <textarea
                id="rx-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Drink plenty of water, rest for 3 days..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white/80 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px] resize-none transition-all"
              />
            </div>

            {/* Submit */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || medications.length === 0 || !selectedPatientId || !doctorId}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                aria-busy={isSubmitting}
              >
                {isSubmitting
                  ? <><Loader2 className="animate-spin" size={18} aria-hidden="true" /> Generating...</>
                  : <><Save size={18} aria-hidden="true" /> Save &amp; Print Prescription</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}