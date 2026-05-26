'use client';

/**
 * CertificatesPage — Lazy-loaded print functionality
 *
 * Performance problem:
 * `react-to-print` uses browser APIs (window, document.execCommand) that
 * are only needed when the user clicks "Print". Eagerly importing it adds
 * ~40KB to the initial JS bundle for a feature only ~5% of users trigger per session.
 *
 * Fix: The actual print logic is extracted to <PrintButton> which is loaded
 * via next/dynamic with { ssr: false }. This means:
 * ✅ react-to-print is NOT in the initial bundle
 * ✅ It is downloaded as a separate chunk only when this page is first rendered
 * ✅ ssr: false prevents "window is not defined" errors on the server
 *
 * The certificate preview form itself stays eager — it's just HTML + useState.
 */

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/ui/icons';

// ── Lazy-load the print button — react-to-print NOT in initial bundle ─────────
const PrintButton = dynamic(() => import('@/components/certificates/print-button'), {
  ssr: false,
  // Show a disabled placeholder while the chunk loads (~100ms on fast connection)
  loading: () => (
    <Button variant="outline" className="gap-2" disabled aria-busy="true">
      <Icons.spinner className="h-4 w-4 animate-spin" aria-hidden="true" />
      Loading...
    </Button>
  ),
});

export interface CertificateData {
  patientName: string;
  diagnosis: string;
  restPeriod: string;
  date: string;
}

export default function CertificatesPage() {
  const [data, setData] = useState<CertificateData>({
    patientName: '',
    diagnosis: '',
    restPeriod: '',
    date: new Date().toISOString().split('T')[0] ?? '',
  });

  // Ref passed to PrintButton so it can target the certificate DOM node
  const printRef = useRef<HTMLDivElement>(null);

  const update = (field: keyof CertificateData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Medical Certificates" description="Generate and print medical certificates.">
        {/* PrintButton chunk is loaded lazily — not in the initial JS bundle */}
        <PrintButton printRef={printRef} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Form Panel ─────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4 border-none shadow-xl bg-white/50 backdrop-blur-xl">
            <h2 className="font-semibold text-lg">Certificate Details</h2>
            <div className="space-y-3">
              <div className="grid gap-2">
                <label htmlFor="cert-patient" className="text-sm font-medium">Patient Name</label>
                <Input
                  id="cert-patient"
                  value={data.patientName}
                  onChange={update('patientName')}
                  placeholder="e.g. John Doe"
                  className="bg-white/50"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cert-diagnosis" className="text-sm font-medium">Diagnosis / Condition</label>
                <Input
                  id="cert-diagnosis"
                  value={data.diagnosis}
                  onChange={update('diagnosis')}
                  placeholder="e.g. Viral Fever"
                  className="bg-white/50"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cert-rest" className="text-sm font-medium">Rest Period</label>
                <Input
                  id="cert-rest"
                  value={data.restPeriod}
                  onChange={update('restPeriod')}
                  placeholder="e.g. 3 days from today"
                  className="bg-white/50"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cert-date" className="text-sm font-medium">Date</label>
                <Input
                  id="cert-date"
                  type="date"
                  value={data.date}
                  onChange={update('date')}
                  className="bg-white/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Certificate Preview ─────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div
            ref={printRef}
            className="card p-8 border-none shadow-xl bg-white text-slate-900 print:shadow-none print:border-none"
          >
            <div className="text-center border-b pb-6 mb-6">
              <h1 className="text-3xl font-bold font-serif text-slate-900">Medical Certificate</h1>
              <p className="text-sm text-slate-500 mt-2">VitalCache Clinic</p>
            </div>

            <div className="space-y-6 font-serif text-lg leading-relaxed">
              <p>
                This is to certify that{' '}
                <span className="font-bold border-b border-slate-400 px-2">
                  {data.patientName || '________________'}
                </span>{' '}
                is suffering from{' '}
                <span className="font-bold border-b border-slate-400 px-2">
                  {data.diagnosis || '________________'}
                </span>.
              </p>
              <p>
                I have examined the patient on{' '}
                <span className="font-bold">{data.date}</span> and advised rest for{' '}
                <span className="font-bold border-b border-slate-400 px-2">
                  {data.restPeriod || '________________'}
                </span>.
              </p>
              <p>
                The patient is fit to resume duties from{' '}
                <span className="font-bold border-b border-slate-400 px-2">___________</span>.
              </p>
            </div>

            <div className="mt-16 pt-8 flex justify-between items-end">
              <div className="text-sm text-slate-500">Date: {data.date}</div>
              <div className="text-center">
                <div className="h-16 w-32 mb-2 border-b border-slate-400" />
                <p className="font-bold text-sm">Doctor&apos;s Signature</p>
                <p className="text-xs text-slate-500">MBBS, MD</p>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">Preview of the printable certificate.</p>
        </div>
      </div>
    </div>
  );
}
