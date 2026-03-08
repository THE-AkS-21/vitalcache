'use client'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import EmptyState from '@/components/feedback/empty-state'
import { useQuery } from '@tanstack/react-query'
import { listPrescriptions } from '@/lib/api/prescriptions'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function PrescriptionsIndex() {
  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => listPrescriptions({ limit: 50 })
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Prescriptions" description="Manage and issue patient prescriptions.">
        <Link href="/prescriptions/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200">
            <Icons.add className="mr-2 h-4 w-4" />
            New Prescription
          </Button>
        </Link>
      </PageHeader>

      <div className="card p-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
        <div className="rounded-xl border bg-white/50 overflow-hidden">
          {isLoading ? (
            <DataTableSkeleton columnCount={5} rowCount={8} />
          ) : (
            (data && data.length > 0) ? (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Patient ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((prescription) => (
                    <TableRow key={prescription.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono">#{prescription.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                            <Icons.user className="h-4 w-4" />
                          </div>
                          <span className="font-medium">Patient #{prescription.patient_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(prescription.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{prescription.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/prescriptions/${prescription.id}`}>
                          <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                            View
                            <Icons.chevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12">
                <EmptyState
                  title="No prescriptions found"
                  subtitle="Create a new prescription to get started."
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
