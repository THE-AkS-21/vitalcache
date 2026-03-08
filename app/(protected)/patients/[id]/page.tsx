'use client'
import { useQuery } from '@tanstack/react-query'
import { getPatient, getPrescriptionHistory } from '@/lib/api/patients'
import { useParams } from 'next/navigation'

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const patientQ = useQuery({ queryKey: ['patients', id], queryFn: () => getPatient(id) })
  const historyQ = useQuery({
    queryKey: ['patients', id, 'prescriptions'],
    queryFn: () => getPrescriptionHistory(id, { limit: 20, offset: 0 }),
  })

  if (patientQ.isLoading) return 'Loading...'
  if (patientQ.error) return 'Failed to load'

  const p = patientQ.data!
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{p.name}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div><b>Age:</b> {p.age}</div>
          <div><b>Mobile:</b> {p.mobile_number}</div>
          <div><b>Doctor ID:</b> {p.doctor_id}</div>
          <div><b>Updated:</b> {new Date(p.updated_at).toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Prescription History</h2>
          {historyQ.isLoading ? 'Loading...' : (
            <ul className="space-y-2">
              {historyQ.data?.items?.map((p: any) => (
                <div key={p.id} className="flex justify-between p-3 border rounded">
                  <span>Prescription #{p.id}</span>
                  <span className="text-gray-500">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
