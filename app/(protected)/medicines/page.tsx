'use client'
import { useQuery } from '@tanstack/react-query'
import { listMedicines } from '@/lib/api/medicines'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import EmptyState from '@/components/feedback/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'

export default function MedicinesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['medicines'],
        queryFn: () => listMedicines({ limit: 50 })
    })

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Medicines" description="Inventory and stock management." />

            <div className="card p-6 space-y-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
                <div className="rounded-xl border bg-white/50 overflow-hidden">
                    {isLoading ? (
                        <DataTableSkeleton columnCount={6} rowCount={8} />
                    ) : (
                        (data && data.length) ? (
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Name</TableHead>
                                        <TableHead className="font-semibold">Dose</TableHead>
                                        <TableHead className="font-semibold">Frequency</TableHead>
                                        <TableHead className="font-semibold">Brand</TableHead>
                                        <TableHead className="font-semibold">Price</TableHead>
                                        <TableHead className="font-semibold">Stock</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map(m => (
                                        <TableRow key={m.id} className="hover:bg-slate-50/80 transition-colors">
                                            <TableCell className="font-medium text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                                                        <Icons.pill className="h-4 w-4" />
                                                    </div>
                                                    {m.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{m.dose || '-'}</TableCell>
                                            <TableCell>{m.frequency || '-'}</TableCell>
                                            <TableCell>{m.recommended_brands || '-'}</TableCell>
                                            <TableCell className="font-mono">${m.price}</TableCell>
                                            <TableCell>
                                                <Badge variant={m.stock < 10 ? "destructive" : "secondary"} className={m.stock < 10 ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}>
                                                    {m.stock} units
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-12">
                                <EmptyState
                                    title="No medicines found"
                                    subtitle="Your inventory is empty"
                                    icon={Icons.pill}
                                />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
