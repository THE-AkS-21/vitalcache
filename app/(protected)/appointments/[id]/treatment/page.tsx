"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function TreatmentPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [saving, setSaving] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");

  const handleSave = async () => {
    setSaving(true);
    // Mock save
    setTimeout(() => {
      setSaving(false);
      toast.success("Treatment notes saved successfully");
      router.push("/appointments");
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 animate-fade-in print:p-0 print:m-0">
      
      {/* Left Pane - Patient Info */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 print:hidden">
        <Card className="border-none shadow-xl bg-white/60 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl text-white">
            <CardTitle className="text-xl">Patient Details</CardTitle>
            <CardDescription className="text-blue-100">Appointment #{appointmentId.substring(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                <Icons.user className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">John Doe</h2>
              <p className="text-gray-500">Male, 34 years</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Blood Group</span>
                <span className="text-gray-900 font-bold">O+</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Height</span>
                <span className="text-gray-900 font-bold">180 cm</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Weight</span>
                <span className="text-gray-900 font-bold">75 kg</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500 font-medium">Allergies</span>
                <span className="text-red-500 font-bold">Penicillin</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Pane - Vertical Timeline */}
      <div className="w-full lg:w-2/3 print:w-full">
        <Card className="border-none shadow-xl bg-white/60 backdrop-blur-xl h-full">
          <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Treatment Timeline</CardTitle>
              <CardDescription>History of diagnosis and prescriptions</CardDescription>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <Icons.download className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-8">
            <div className="relative border-l-2 border-indigo-100 ml-3 md:ml-6 space-y-12 pb-8">
              
              {/* Past Node 1 */}
              <div className="relative pl-8 md:pl-10">
                <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-gray-300 border-4 border-white shadow"></div>
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Oct 12, 2023</span>
                  <h3 className="text-lg font-bold text-gray-700">Routine Check-up</h3>
                </div>
                <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Rx:</span> Patient complained of mild headache.</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Medication:</span> Paracetamol 500mg, 1x day for 3 days.</p>
                </div>
              </div>

              {/* Past Node 2 */}
              <div className="relative pl-8 md:pl-10">
                <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-gray-300 border-4 border-white shadow"></div>
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jan 05, 2024</span>
                  <h3 className="text-lg font-bold text-gray-700">Viral Fever</h3>
                </div>
                <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Rx:</span> High fever 102F, body ache.</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Medication:</span> Azithromycin 500mg, 2x day for 5 days.</p>
                </div>
              </div>

              {/* Current Editable Node */}
              <div className="relative pl-8 md:pl-10">
                <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-indigo-500 border-4 border-white shadow animate-pulse"></div>
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Today</span>
                  <h3 className="text-xl font-bold text-indigo-900">Current Diagnosis</h3>
                </div>
                
                <div className="bg-indigo-50/30 rounded-xl p-5 border border-indigo-100 shadow-sm space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Diagnosis / Symptoms</label>
                    <Input 
                      placeholder="e.g., Acute Bronchitis" 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Prescription (Rx)</label>
                    <Textarea 
                      placeholder="List medicines, dosage, and duration..." 
                      className="min-h-[120px] bg-white"
                      value={medicines}
                      onChange={(e) => setMedicines(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2 print:hidden">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Treatment"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
