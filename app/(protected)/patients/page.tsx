'use client';

/**
 * PatientsPage — Client Component (legitimate: uses useQuery + useState for search)
 *
 * Performance improvements:
 * ✅ useDebounce hook replaces the manual setTimeout/clearTimeout pattern
 * ✅ Structured queryKey: ['patients', 'search', debouncedMobile]
 *    — empty string falls back to listing all patients
 * ✅ Proper TypeScript types — no any casts
 * ✅ queryFn is stable (not recreated on every render)
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchPatients, type Patient } from '@/lib/api/patients';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import EmptyState from '@/components/feedback/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PatientsPage() {
  const [mobile, setMobile] = useState('');
  // useDebounce replaces the manual setTimeout/clearTimeout useEffect
  const debouncedMobile = useDebounce(mobile, 300);

  const { data, isLoading } = useQuery<Patient[]>({
    queryKey: ['patients', 'search', debouncedMobile],
    queryFn: ({ signal }) => searchPatients(debouncedMobile, signal),
    // staleTime + gcTime inherited from QueryProvider (60s / 5min)
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Patients" description="Manage patient records and history.">
        <Link href="/patients/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200">
            <Icons.add className="mr-2 h-4 w-4" aria-hidden="true" />
            New Patient
          </Button>
        </Link>
      </PageHeader>

      <div className="card p-6 space-y-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
        {/* Search */}
        <div className="relative max-w-md">
          <Icons.search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="patient-search"
            placeholder="Search by mobile number..."
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 transition-all"
            type="tel"
            autoComplete="tel"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white/50 overflow-hidden">
          {isLoading ? (
            <DataTableSkeleton columnCount={4} rowCount={5} />
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Age</TableHead>
                  <TableHead className="font-semibold">Last Updated</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                          {(p.name ?? p.first_name)?.[0] ?? '?'}
                        </div>
                        {p.name ?? `${p.first_name} ${p.last_name}`}
                      </div>
                    </TableCell>
                    <TableCell>{p.age != null ? `${p.age} yrs` : '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/patients/${p.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" aria-label={`View patient ${p.name ?? p.first_name}`}>
                          <Icons.chevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
                title="No patients found"
                subtitle={mobile ? 'Try searching with a different number' : 'Start by searching for a patient'}
                icon={Icons.patients}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
