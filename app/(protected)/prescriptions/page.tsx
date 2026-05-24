'use client';

/**
 * PrescriptionsIndex — Client Component (legitimate: uses useQuery hook)
 *
 * Performance improvements:
 * ✅ useQuery staleTime inherited from QueryProvider defaults (60s)
 * ✅ Properly typed queryFn return type (no any)
 * ✅ Structured queryKey with ['prescriptions', 'list'] — avoids cache key collisions
 *    with patient-specific prescription queries
 */

import { useQuery } from '@tanstack/react-query';
import { listPrescriptions, type Prescription } from '@/lib/api/prescriptions';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';
import EmptyState from '@/components/feedback/empty-state';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function PrescriptionsIndex() {
  const { data, isLoading } = useQuery<Prescription[]>({
    // ['prescriptions', 'list'] distinguishes from ['prescriptions', patientId]
    queryKey: ['prescriptions', 'list'],
    queryFn: ({ signal }) => listPrescriptions({ limit: 50 }, signal),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Prescriptions" description="Manage and issue patient prescriptions.">
        <Link href="/prescriptions/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200">
            <Icons.add className="mr-2 h-4 w-4" aria-hidden="true" />
            New Prescription
          </Button>
        </Link>
      </PageHeader>

      <div className="card p-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
        <div className="rounded-xl border bg-white/50 overflow-hidden">
          {isLoading ? (
            <DataTableSkeleton columnCount={5} rowCount={8} />
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Patient</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((prescription) => (
                  <TableRow key={prescription.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono text-xs text-gray-500">
                      #{prescription.prescription_id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                          <Icons.user className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span className="font-medium">
                          Patient #{prescription.patient_id.substring(0, 8)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(prescription.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prescription.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {prescription.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/prescriptions/${prescription.id}`}>
                        <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                          View
                          <Icons.chevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
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
          )}
        </div>
      </div>
    </div>
  );
}
