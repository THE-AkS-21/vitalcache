'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createPrescription } from '@/lib/api/prescriptions'
import { listMedicines } from '@/lib/api/medicines'
import { useRouter } from 'next/navigation'
import { Plus, Trash } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Icons } from '@/components/ui/icons'

export default function NewPrescriptionPage() {
  const router = useRouter()
  const [patientId, setPatientId] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedMedicines, setSelectedMedicines] = useState<Array<{ medicine_id: number, dose: string, duration: string, frequency: string }>>([])

  const { data: medicines } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => listMedicines({ limit: 100 })
  })

  const mutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      router.push('/prescriptions')
    }
  })

  const addMedicine = () => {
    if (medicines && medicines.length > 0) {
      setSelectedMedicines([...selectedMedicines, { medicine_id: medicines[0].id, dose: '', duration: '', frequency: '' }])
    }
  }

  const removeMedicine = (index: number) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index))
  }

  const updateMedicine = (index: number, field: keyof typeof selectedMedicines[0], value: string | number) => {
    const newMedicines = [...selectedMedicines]
    newMedicines[index] = { ...newMedicines[index], [field]: value }
    setSelectedMedicines(newMedicines)
  }

  const submit = () => {
    mutation.mutate({
      patient_id: Number(patientId),
      notes,
      medicines: selectedMedicines
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="New Prescription" description="Create a new prescription for a patient." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Icons.patients className="h-4 w-4 text-blue-600" />
                Patient ID
              </label>
              <Input
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                placeholder="Enter Patient ID"
                className="bg-white/50"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Icons.pill className="h-4 w-4 text-blue-600" />
                  Medicines
                </label>
                <Button variant="outline" size="sm" onClick={addMedicine} className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                  <Plus className="w-4 h-4 mr-2" /> Add Medicine
                </Button>
              </div>

              <div className="space-y-3">
                {selectedMedicines.map((item, index) => (
                  <div key={index} className="flex flex-col gap-3 p-4 border rounded-xl bg-white/50 shadow-sm hover:shadow-md transition-all">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Medicine Name</label>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={item.medicine_id}
                          onChange={e => updateMedicine(index, 'medicine_id', Number(e.target.value))}
                        >
                          {medicines?.map(m => (
                            <option key={m.id} value={m.id}>{m.name} (${m.price})</option>
                          ))}
                        </select>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeMedicine(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0 mt-5">
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Dose</label>
                        <Input
                          placeholder="e.g. 500mg"
                          value={item.dose}
                          onChange={e => updateMedicine(index, 'dose', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
                        <Input
                          placeholder="e.g. 5 days"
                          value={item.duration}
                          onChange={e => updateMedicine(index, 'duration', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
                        <Input
                          placeholder="e.g. 1-0-1"
                          value={item.frequency}
                          onChange={e => updateMedicine(index, 'frequency', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {selectedMedicines.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50 text-muted-foreground">
                    <Icons.pill className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No medicines added yet</p>
                    <Button variant="link" onClick={addMedicine} className="text-blue-600">Add your first medicine</Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional instructions..."
                className="min-h-[100px] bg-white/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 border-none shadow-xl bg-gradient-to-br from-blue-600 to-purple-700 text-white">
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <div className="space-y-4 text-blue-100 text-sm">
              <div className="flex justify-between">
                <span>Patient ID</span>
                <span className="font-mono bg-white/20 px-2 rounded">{patientId || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Medicines Count</span>
                <span>{selectedMedicines.length}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <Button
                onClick={submit}
                disabled={mutation.isPending}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none shadow-lg"
              >
                {mutation.isPending ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Prescription'
                )}
              </Button>
            </div>
          </div>

          {mutation.isError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center gap-2">
              <Icons.alert className="h-4 w-4" />
              Failed to create prescription. Please check inputs.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
