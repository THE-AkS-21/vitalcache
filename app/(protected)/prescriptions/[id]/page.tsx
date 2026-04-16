"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { prescriptionsApi, Prescription } from '@/lib/api/prescriptions';
import { Printer } from 'lucide-react';

export default function PrintPrescription() {
    const { id } = useParams();
    const [rx, setRx] = useState<Prescription | null>(null);

    useEffect(() => {
        if (id) {
            prescriptionsApi.getById(id as string).then(res => setRx(res)).catch(console.error);
        }
    }, [id]);

    if (!rx) return <div className="p-10 text-center">Loading Prescription...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">

            {/* Action Bar - Hidden during print */}
            <div className="no-print w-full max-w-4xl flex justify-end mb-4">
                <button
                    onClick={() => window.print()}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                    <Printer size={18} className="mr-2" />
                    Print / Save PDF
                </button>
            </div>

            {/* A4 Canvas */}
            <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-xl text-black">

                {/* Header: Hospital & Doctor Info */}
                <header className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-indigo-900">VITALCACHE CARE</h1>
                        <p className="text-sm text-gray-600 mt-1">123 Health Avenue, Medical District</p>
                        <p className="text-sm text-gray-600">Contact: +1 (555) 123-4567</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-800">Dr. Smith Doe</h2>
                        <p className="text-sm font-semibold text-gray-600">MD, General Physician</p>
                        <p className="text-xs text-gray-500">Reg No: MED-89234</p>
                    </div>
                </header>

                {/* Patient Details */}
                <section className="flex justify-between text-sm mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div>
                        <p><span className="font-semibold text-gray-700">Patient ID:</span> {rx.patient_id.substring(0, 8).toUpperCase()}</p>
                        <p className="mt-1"><span className="font-semibold text-gray-700">Name:</span> John Doe</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-semibold text-gray-700">Date:</span> {new Date(rx.created_at).toLocaleDateString()}</p>
                        <p className="mt-1"><span className="font-semibold text-gray-700">Rx ID:</span> {rx.prescription_id.split('-')[0].toUpperCase()}</p>
                    </div>
                </section>

                {/* The Rx Symbol */}
                <div className="text-4xl font-serif font-bold text-gray-800 mb-6">Rx</div>

                {/* Medications List */}
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
                        {rx.medications.map((med, idx) => (
                            <tr key={idx} className="border-b border-dashed border-gray-200">
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

                {/* Notes & Advice */}
                {rx.notes && (
                    <section className="mb-12">
                        <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">Clinical Notes & Advice</h3>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{rx.notes}</p>
                    </section>
                )}

                {/* Footer / Signature */}
                <footer className="mt-auto pt-20 flex justify-end">
                    <div className="text-center">
                        <div className="border-b border-gray-800 w-48 mb-2"></div>
                        <p className="text-sm font-bold text-gray-800">Doctor's Signature</p>
                    </div>
                </footer>

            </div>
        </div>
    );
}