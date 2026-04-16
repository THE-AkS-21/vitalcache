"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Trash2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { ClayCard } from '@/components/ui/card'; // Using your generic card or ClayCard
import { MedicineSearch } from '@/components/ui/medicine-search';
import { patientsApi, Patient } from '@/lib/api/patients';
import { prescriptionsApi, Medication } from '@/lib/api/prescriptions';
import { Medicine } from '@/lib/api/medicines';

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState('');

  // 1. Fetch Patients on load
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientsApi.list(100, 0);
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to load patients", err);
        setError("Failed to load patients. Please try refreshing.");
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  // 2. Add Medicine from Autocomplete to the Medication Array
  const handleAddMedicine = (med: Medicine) => {
    // Check if already added
    if (medications.some(m => m.medicine_id === med.id)) return;

    const newMedication: Medication = {
      medicine_id: med.id,
      name: med.name,
      dosage: med.dosage_options?.[0] || '1 Tablet',
      frequency: med.frequency_suggestions?.[0] || 'Twice a day',
      duration_days: 5, // Default duration
      instructions: 'After food',
    };
    setMedications([...medications, newMedication]);
  };

  // 3. Update specific fields of a selected medication
  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  // 4. Remove a medication
  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // 5. Submit to Go Backend
  const handleSubmit = async () => {
    setError(null);
    if (!selectedPatientId) return setError("Please select a patient.");
    if (medications.length === 0) return setError("Please add at least one medication.");

    setIsSubmitting(true);
    try {
      // NOTE: Using a dummy hospital UUID. In a real app, pull this from the authStore / doctor profile.
      const dummyHospitalId = "00000000-0000-0000-0000-000000000000";

      const payload = {
        patient_id: selectedPatientId,
        hospital_id: dummyHospitalId,
        medications,
        notes
      };

      const res = await prescriptionsApi.create(payload);
      // Redirect to the printable view we created earlier
      router.push(`/prescriptions/${res.id}/print`);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error?.message || "Failed to create prescription.");
      setIsSubmitting(false);
    }
  };

  return (
      <div className="p-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-clay-text flex items-center">
            <FileText className="mr-3 text-indigo-500" size={32} />
            Create New Prescription
          </h1>
          <p className="text-gray-500 mt-2">Search medicines, define dosages, and generate a printable record.</p>
        </motion.div>

        {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center shadow-sm">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Patient Selection & Medicine Search */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#e0e5ec] shadow-clay-out rounded-2xl p-6 border border-white/40">
              <h2 className="text-lg font-bold text-gray-700 flex items-center mb-4">
                <User className="mr-2 text-indigo-500" size={20} />
                Select Patient
              </h2>
              {loadingPatients ? (
                  <p className="text-sm text-gray-500 animate-pulse">Loading patients...</p>
              ) : (
                  <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full p-3 rounded-xl border-none shadow-clay-in bg-[#e0e5ec] text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="" disabled>Choose a patient...</option>
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
              )}
            </div>

            <div className="bg-[#e0e5ec] shadow-clay-out rounded-2xl p-6 border border-white/40">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Add Medicine</h2>
              <MedicineSearch onSelect={handleAddMedicine} />
            </div>
          </div>

          {/* RIGHT COLUMN: The Rx Form (Medications List) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#e0e5ec] shadow-clay-out rounded-2xl p-6 border border-white/40 min-h-[400px] flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">Rx Medications</h2>

              {medications.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p>No medications added yet.</p>
                    <p className="text-sm mt-1">Use the search bar on the left to add medicines.</p>
                  </div>
              ) : (
                  <div className="flex-1 space-y-4">
                    <AnimatePresence>
                      {medications.map((med, idx) => (
                          <motion.div
                              key={med.medicine_id + idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white flex flex-col sm:flex-row gap-4 relative"
                          >
                            <button
                                onClick={() => removeMedication(idx)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                            >
                              <Trash2 size={18} />
                            </button>

                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-indigo-900 mb-3">{med.name}</h3>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Dosage</label>
                                  <input
                                      type="text" value={med.dosage}
                                      onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                                      className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none text-sm font-medium text-gray-800"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Frequency</label>
                                  <input
                                      type="text" value={med.frequency}
                                      onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                                      className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none text-sm font-medium text-gray-800"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Duration (Days)</label>
                                  <input
                                      type="number" value={med.duration_days} min={1}
                                      onChange={(e) => updateMedication(idx, 'duration_days', parseInt(e.target.value) || 1)}
                                      className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none text-sm font-medium text-gray-800"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Instructions</label>
                                  <input
                                      type="text" value={med.instructions}
                                      onChange={(e) => updateMedication(idx, 'instructions', e.target.value)}
                                      className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none text-sm font-medium text-gray-800"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
              )}

              {/* Notes Section */}
              <div className="mt-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Clinical Notes & Advice</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Drink plenty of water, rest for 3 days..."
                    className="w-full p-4 rounded-xl border-none shadow-clay-in bg-[#e0e5ec] text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px] resize-none"
                />
              </div>

              {/* Submit Action */}
              <div className="mt-8 pt-4 border-t border-gray-300 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || medications.length === 0 || !selectedPatientId}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
                  {isSubmitting ? "Generating..." : "Save & Print Prescription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}