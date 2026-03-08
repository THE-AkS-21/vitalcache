'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPatientSchema, CreatePatientInput } from '@/lib/validators/patient'
import { createPatient } from '@/lib/api/patients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewPatientPage() {
  const r = useRouter()
  const [err, setErr] = useState<string | null>(null)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema)
  })

  const onSubmit = async (data: CreatePatientInput) => {
    setErr(null)
    try {
      const p = await createPatient(data)
      r.replace(`/patients/${p.id}`)
    } catch (e: any) {
      setErr(e?.response?.data?.error?.message || 'Create failed')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New Patient</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-4 grid gap-3 md:grid-cols-2">
        <div><label className="text-sm">Name</label><Input {...register('name')} /></div>
        <div><label className="text-sm">Age</label><Input type="number" {...register('age', { valueAsNumber: true })} /></div>
        <div><label className="text-sm">Sex</label><Input {...register('sex')} /></div>
        <div><label className="text-sm">Mobile</label><Input {...register('mobile_number')} /></div>
        <div className="md:col-span-2">
          <label className="text-sm">Email</label><Input type="email" {...register('email')} />
        </div>
        {err && <div className="md:col-span-2 text-sm text-red-600">{err}</div>}
        <div className="md:col-span-2"><Button disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button></div>
      </form>
    </div>
  )
}
