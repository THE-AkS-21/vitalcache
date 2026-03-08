'use client'
import { useState, useRef } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Icons } from '@/components/ui/icons'
import { useReactToPrint } from 'react-to-print'

export default function CertificatesPage() {
    const [patientName, setPatientName] = useState('')
    const [diagnosis, setDiagnosis] = useState('')
    const [restPeriod, setRestPeriod] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    const componentRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    })

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Medical Certificates" description="Generate and print medical certificates.">
                <Button onClick={handlePrint} variant="outline" className="gap-2">
                    <Icons.file className="h-4 w-4" />
                    Print Certificate
                </Button>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <div className="card p-6 space-y-4 border-none shadow-xl bg-white/50 backdrop-blur-xl">
                        <h3 className="font-semibold text-lg">Certificate Details</h3>
                        <div className="space-y-3">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Patient Name</label>
                                <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. John Doe" className="bg-white/50" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Diagnosis / Condition</label>
                                <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Viral Fever" className="bg-white/50" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Rest Period</label>
                                <Input value={restPeriod} onChange={e => setRestPeriod(e.target.value)} placeholder="e.g. 3 days from today" className="bg-white/50" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card p-8 border-none shadow-xl bg-white text-slate-900 print:shadow-none print:border-none" ref={componentRef}>
                        {/* Print-only styles can be handled via @media print in globals.css or inline styles */}
                        <div className="text-center border-b pb-6 mb-6">
                            <h1 className="text-3xl font-bold font-serif text-slate-900">Medical Certificate</h1>
                            <p className="text-sm text-slate-500 mt-2">VitalCache Clinic • Dr. John Smith</p>
                        </div>

                        <div className="space-y-6 font-serif text-lg leading-relaxed">
                            <p>
                                This is to certify that <span className="font-bold border-b border-slate-400 px-2">{patientName || '________________'}</span> is suffering from <span className="font-bold border-b border-slate-400 px-2">{diagnosis || '________________'}</span>.
                            </p>
                            <p>
                                I have examined the patient on <span className="font-bold">{date}</span> and advised rest for <span className="font-bold border-b border-slate-400 px-2">{restPeriod || '________________'}</span>.
                            </p>
                            <p>
                                The patient is fit to resume duties from <span className="font-bold border-b border-slate-400 px-2">___________</span>.
                            </p>
                        </div>

                        <div className="mt-16 pt-8 flex justify-between items-end">
                            <div className="text-sm text-slate-500">
                                Date: {date}
                            </div>
                            <div className="text-center">
                                <div className="h-16 w-32 mb-2 border-b border-slate-400"></div>
                                <p className="font-bold text-sm">Dr. John Smith</p>
                                <p className="text-xs text-slate-500">MBBS, MD (Cardiology)</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                        Preview of the printable certificate.
                    </p>
                </div>
            </div>
        </div>
    )
}
