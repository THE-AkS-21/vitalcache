'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Save, User, Trash2, FileText, AlertCircle, Loader2, ListPlus } from 'lucide-react';
import { MedicineSearch } from '@/components/ui/medicine-search';
import { listPatients, type Patient } from '@/lib/api/patients';
import { prescriptionsApi, type Prescription, type Medication } from '@/lib/api/prescriptions';
import { medicalReportsApi } from '@/lib/api/medical_reports';
import { type Medicine } from '@/lib/api/medicines';
import { useAuthStore } from '@/store/authStore';
import type { AxiosError } from 'axios';
import apiClient from '@/services/api.client';

export default function NewReportPage() {
  const router = useRouter();

  const doctorId = useAuthStore((s) => s.user?.doctor_id ?? null);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [diagnosisBody, setDiagnosisBody] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [precautions, setPrecautions] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: doctorProfile } = useQuery({
    queryKey: ['doctors', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      const res = await apiClient.get(`/api/v1/doctors/${doctorId}`);
      return res.data;
    },
    enabled: !!doctorId,
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery<Patient[]>({
    queryKey: ['patients', 'list'],
    queryFn: ({ signal }) => listPatients({ limit: 100 }, signal),
  });

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<Prescription[]>({
    queryKey: ['prescriptions', 'templates'],
    queryFn: ({ signal }) => prescriptionsApi.list({ limit: 100 }, signal),
  });

  const handleApplyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (!templateId) return;
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    
    // Auto-populate fields from the selected template. Note this is a clone so edits won't affect the original template.
    if (template.disease_name) setDiseaseName(template.disease_name);
    if (template.notes) setPrecautions(template.notes);
    if (template.medications) {
        setMedications([...template.medications]);
    }
  };

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

  const handleSubmit = async () => {
    setError(null);
    if (!selectedPatientId) { setError('Please select a patient.'); return; }
    if (!diseaseName.trim()) { setError('Please enter a disease name.'); return; }
    if (medications.length === 0) { setError('Please add at least one medication.'); return; }
    if (!doctorId) {
      setError('Your doctor profile is not loaded. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await medicalReportsApi.create({
        patient_id: selectedPatientId,
        hospital_id: doctorId, // temporary until real hospital ID is given
        disease_name: diseaseName,
        diagnosis_body: diagnosisBody,
        medications,
        precautions: precautions,
      });

      // If a fee is set, create the billing record
      if (doctorProfile?.consultation_fee) {
        await apiClient.post('/api/v1/billings', {
            patient_id: selectedPatientId,
            doctor_id: doctorId,
            medical_report_id: res.id,
            amount: doctorProfile.consultation_fee,
            status: isPaid ? 'PAID' : 'PENDING'
        });
      }

      router.push(`/medical-reports/${res.id}`);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      setError(axiosErr?.response?.data?.error?.message ?? 'Failed to create medical report.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="text-indigo-500 flex-shrink-0" size={32} aria-hidden="true" />
          Create Medical Report
        </h1>
        <p className="text-gray-500 mt-1">Record a patient visit, diagnose, and prescribe treatment.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200 shadow-sm animate-fade-in">
          <AlertCircle size={20} className="flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 border-none shadow-xl bg-white/50 backdrop-blur-xl space-y-3">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <User size={18} className="text-indigo-500" /> Select Patient
            </h2>
            {loadingPatients ? (
              <p className="text-sm text-gray-400 animate-pulse">Loading patients...</p>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white/80 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="" disabled>Choose a patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? `${p.first_name} ${p.last_name}`}</option>
                ))}
              </select>
            )}
          </div>

          <div className="card p-5 border-none shadow-xl bg-indigo-50/50 backdrop-blur-xl space-y-3 border border-indigo-100">
            <h2 className="text-base font-bold text-indigo-900 flex items-center gap-2">
              <ListPlus size={18} className="text-indigo-500" /> Apply Template
            </h2>
            <p className="text-xs text-indigo-700">Select a pre-defined prescription to auto-fill treatment.</p>
            {loadingTemplates ? (
               <p className="text-sm text-gray-400 animate-pulse">Loading templates...</p>
            ) : (
                <select
                onChange={handleApplyTemplate}
                defaultValue=""
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white text-indigo-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                <option value="" disabled>Select a Template...</option>
                {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.disease_name || `Template ${t.id.slice(0,6)}`} ({t.medications?.length || 0} meds)</option>
                ))}
                </select>
            )}
          </div>

          <div className="card p-5 border-none shadow-xl bg-white/50 backdrop-blur-xl space-y-3">
            <h2 className="text-base font-bold text-gray-700">Add Medicine</h2>
            <MedicineSearch onSelect={handleAddMedicine} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 border-none shadow-xl bg-white/50 backdrop-blur-xl flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Diagnosis & Treatment
            </h2>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Disease Name <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={diseaseName} 
                        onChange={(e) => setDiseaseName(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-400 outline-none text-gray-800 font-medium"
                        placeholder="e.g. Viral Fever"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis Notes / Body</label>
                    <textarea 
                        value={diagnosisBody} 
                        onChange={(e) => setDiagnosisBody(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-400 outline-none text-gray-800 min-h-[80px] resize-none"
                        placeholder="Patient presented with 101F fever, chills..."
                    />
                </div>
            </div>

            <h3 className="text-md font-bold text-gray-700 mb-3">Rx Medications</h3>
            {medications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 py-8 bg-gray-50/50 rounded-xl">
                <FileText size={48} className="opacity-40" />
                <p className="font-medium">No medications added.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map((med, idx) => (
                  <div key={`${med.medicine_id}-${idx}`} className="relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <button onClick={() => removeMedication(idx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    <h4 className="font-bold text-indigo-900 mb-3">{med.name}</h4>
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
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
                          <input
                            type={type}
                            value={value}
                            min={type === 'number' ? 1 : undefined}
                            onChange={(e) => updateMedication(idx, field, type === 'number' ? (parseInt(e.target.value) || 1) : e.target.value)}
                            className="w-full mt-1 p-1.5 bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none text-sm font-medium text-gray-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precautions & Follow-up</label>
              <textarea
                value={precautions}
                onChange={(e) => setPrecautions(e.target.value)}
                placeholder="Drink plenty of water..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-400 min-h-[100px] resize-none"
              />
            </div>

            {doctorProfile?.consultation_fee && (
              <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
                  <div>
                      <h4 className="font-bold text-green-900">Consultation Fee: ${doctorProfile.consultation_fee}</h4>
                      <p className="text-sm text-green-700">Record payment status for this visit.</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                          type="checkbox" 
                          checked={isPaid}
                          onChange={(e) => setIsPaid(e.target.checked)}
                          className="w-5 h-5 rounded text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="font-bold text-green-900">Mark as Paid</span>
                  </label>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || medications.length === 0 || !selectedPatientId || !diseaseName}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><Save size={18} /> Save &amp; View Report</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}