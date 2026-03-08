'use client'
import { useQuery } from '@tanstack/react-query'
import { searchPatients } from '@/lib/api/patients'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import EmptyState from '@/components/feedback/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PatientsPage() {
  const [mobile, setMobile] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(mobile), 300)
    return () => clearTimeout(t)
  }, [mobile])

  const { data, isLoading } = useQuery({
    queryKey: ['patients', 'search', debounced],
    queryFn: () => searchPatients(debounced || ''),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Patients" description="Manage patient records and history.">
        <Link href="/patients/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200">
            <Icons.add className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </Link>
      </PageHeader>

      <div className="card p-6 space-y-6 border-none shadow-xl bg-white/50 backdrop-blur-xl">
        <div className="relative max-w-md">
          <Icons.search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by mobile number..."
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="rounded-xl border bg-white/50 overflow-hidden">
          {isLoading ? (
            <DataTableSkeleton columnCount={4} rowCount={5} />
          ) : (
            (data && data.length) ? (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Age</TableHead>
                    <TableHead className="font-semibold">Mobile</TableHead>
                    <TableHead className="font-semibold">Last Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(p => (
                    <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {p.name[0]}
                          </div>
                          {p.name}
                        </div>
                      </TableCell>
                      <TableCell>{p.age} yrs</TableCell>
                      <TableCell>{p.mobile_number}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon">
                            <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
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
                  subtitle={mobile ? "Try searching with a different number" : "Start by searching for a patient"}
                  icon={Icons.patients}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
