'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPatientSchema, type CreatePatientInput } from '@/lib/validators/patient';
import { createPatient } from '@/lib/api/patients';
import type { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/page-header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewPatientPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
  });

  const onSubmit = async (formData: CreatePatientInput) => {
    setErr(null);
    try {
      const patient = await createPatient(formData);
      router.replace(`/patients/${patient.id}`);
    } catch (error: unknown) {
      const axiosErr = error as AxiosError<{ error?: { message?: string } }>;
      setErr(axiosErr?.response?.data?.error?.message ?? 'Failed to create patient. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <PageHeader title="New Patient" description="Register a new patient record." />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card p-6 border-none shadow-xl bg-white/50 backdrop-blur-xl grid gap-4 md:grid-cols-2"
      >
        <div className="space-y-1">
          <label htmlFor="np-name" className="text-sm font-medium">Full Name</label>
          <Input id="np-name" {...register('name')} placeholder="e.g. John Doe" className="bg-white/50" />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="np-age" className="text-sm font-medium">Age</label>
          <Input
            id="np-age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            placeholder="e.g. 35"
            className="bg-white/50"
            min={0}
            max={150}
          />
          {errors.age && <p className="text-xs text-red-600">{errors.age.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="np-sex" className="text-sm font-medium">Sex</label>
          <Input id="np-sex" {...register('sex')} placeholder="Male / Female / Other" className="bg-white/50" />
        </div>

        <div className="space-y-1">
          <label htmlFor="np-mobile" className="text-sm font-medium">Mobile Number</label>
          <Input
            id="np-mobile"
            type="tel"
            {...register('mobile_number')}
            placeholder="e.g. +91 9876543210"
            className="bg-white/50"
          />
          {errors.mobile_number && <p className="text-xs text-red-600">{errors.mobile_number.message}</p>}
        </div>

        <div className="md:col-span-2 space-y-1">
          <label htmlFor="np-email" className="text-sm font-medium">Email (optional)</label>
          <Input
            id="np-email"
            type="email"
            {...register('email')}
            placeholder="e.g. patient@example.com"
            className="bg-white/50"
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {err && (
          <div className="md:col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="md:col-span-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? 'Saving...' : 'Save Patient'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
