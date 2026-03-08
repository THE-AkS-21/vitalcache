'use client'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useQuery } from '@tanstack/react-query'
import { getPrescription } from '@/lib/api/prescriptions'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

export default function PrescriptionDetailPage({ params }: { params: { id: string } }) {
    const componentRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    })

    const { data, isLoading } = useQuery({
        queryKey: ['prescriptions', params.id],
        queryFn: () => getPrescription(Number(params.id))
    })

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
        )
    }

    if (!data) return <div>Prescription not found</div>

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title={`Prescription #${data.id}`} description={`Created on ${format(new Date(data.created_at), 'MMMM d, yyyy')}`}>
                <Button onClick={handlePrint} variant="outline" className="gap-2">
                    <Icons.file className="h-4 w-4" />
                    Print Prescription
                </Button>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-8 border-none shadow-xl bg-white text-slate-900 print:shadow-none print:border-none" ref={componentRef}>
                        <div className="flex justify-between items-start border-b pb-6 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold font-serif text-slate-900">VitalCache Clinic</h1>
                                <p className="text-sm text-slate-500 mt-1">123 Medical Center Dr, Health City</p>
                                <p className="text-sm text-slate-500">Phone: (555) 123-4567</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-blue-600">PRESCRIPTION</h2>
                                <p className="text-sm text-slate-500 mt-1">#{data.id}</p>
                                <p className="text-sm text-slate-500">{format(new Date(data.created_at), 'MMM d, yyyy')}</p>
                            </div>
                        </div>

                        <div className="mb-8 p-4 bg-slate-50 rounded-lg print:bg-transparent print:p-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Patient Details</p>
                                    <p className="font-medium text-lg">Patient #{data.patient_id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Doctor</p>
                                    <p className="font-medium text-lg">Dr. Smith</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4 border-b pb-2">Medicines</h3>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-sm text-slate-500">
                                            <th className="pb-2 font-medium">Medicine</th>
                                            <th className="pb-2 font-medium">Dose</th>
                                            <th className="pb-2 font-medium">Frequency</th>
                                            <th className="pb-2 font-medium">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {data.items?.map((item: any, index: number) => (
                                            <tr key={index} className="border-b border-slate-100 last:border-0">
                                                <td className="py-3 font-medium">{item.medicine?.name || `Medicine #${item.medicine_id}`}</td>
                                                <td className="py-3">{item.dose}</td>
                                                <td className="py-3">{item.frequency}</td>
                                                <td className="py-3">{item.duration}</td>
                                            </tr>
                                        ))}
                                        {(!data.items || data.items.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="py-4 text-center text-slate-500 italic">No medicines listed</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {data.notes && (
                                <div>
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-2">Notes</h3>
                                    <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-slate-700 print:bg-transparent print:border-none print:p-0">
                                        {data.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-16 pt-8 flex justify-between items-end print:mt-32">
                            <div className="text-center">
                                <div className="h-16 w-32 mb-2 border-b border-slate-400"></div>
                                <p className="font-bold text-sm">Signature</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t text-center text-xs text-slate-400 print:block hidden">
                            Generated by VitalCache on {format(new Date(), 'PPP p')}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card p-6 space-y-4 border-none shadow-xl bg-white/50 backdrop-blur-xl">
                        <h3 className="font-semibold text-lg">Actions</h3>
                        <Button onClick={handlePrint} className="w-full bg-blue-600 hover:bg-blue-700">
                            <Icons.file className="mr-2 h-4 w-4" />
                            Print / Save PDF
                        </Button>
                        <Button variant="outline" className="w-full">
                            <Icons.mail className="mr-2 h-4 w-4" />
                            Email to Patient
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
