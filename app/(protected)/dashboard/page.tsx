'use client'

import { useQuery } from '@tanstack/react-query'
import { searchPatients } from '@/lib/api/patients'
import { listMedicines } from '@/lib/api/medicines'
import { StatCard, StatCardGrid } from '@/components/ui/stat-card'
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent } from '@/components/ui/enhanced-card'
import { SimplePageTransition } from '@/components/ui/page-transition'
import { Icons } from '@/components/ui/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  // Fetch patients for count and recent list
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', 'dashboard'],
    queryFn: () => searchPatients('')
  })

  // Fetch medicines for inventory count
  const { data: medicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ['medicines', 'dashboard'],
    queryFn: () => listMedicines({ limit: 100 })
  })

  const recentPatients = patients?.slice(0, 5) ?? []
  const statsLoading = patientsLoading || medicinesLoading

  return (
    <SimplePageTransition>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your clinic overview
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200 hover:shadow-xl hover-lift"
          >
            <Link href="/patients/new">
              <Icons.add className="w-4 h-4 mr-2" />
              Add Patient
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <StatCardGrid className="animate-fade-in-up delay-100">
          <StatCard
            title="Total Patients"
            value={patients?.length ?? 0}
            description="All registered patients"
            icon={Icons.patients}
            trend={{
              value: 12,
              direction: 'up',
              label: 'vs last month'
            }}
            loading={statsLoading}
            animate={!statsLoading}
            gradient
          />
          <StatCard
            title="Appointments Today"
            value={0}
            description="Scheduled for today"
            icon={Icons.appointments}
            loading={statsLoading}
            animate={!statsLoading}
            gradient
          />
          <StatCard
            title="Medicines in Stock"
            value={medicines?.length ?? 0}
            description="Available inventory"
            icon={Icons.pill}
            trend={{
              value: 8,
              direction: 'up',
              label: 'new this week'
            }}
            loading={statsLoading}
            animate={!statsLoading}
            gradient
          />
          <StatCard
            title="Monthly Revenue"
            value="$0"
            description="This month's earnings"
            icon={Icons.dollar}
            trend={{
              value: 15,
              direction: ' up',
              label: 'vs last month'
            }}
            loading={statsLoading}
            animate={!statsLoading}
            gradient
          />
        </StatCardGrid>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up delay-200">
          {/* Recent Patients - Takes 2 columns on large screens */}
          <EnhancedCard
            variant="elevated"
            hover={false}
            className="lg:col-span-2"
          >
            <EnhancedCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Patients</h2>
                  <p className="text-sm text-gray-500 mt-1">Latest patient registrations</p>
                </div>
                <Button variant="outline" size="sm" asChild className="hover-lift">
                  <Link href="/patients">
                    View All
                    <Icons.chevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              {patientsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 animate-shimmer">
                      <div className="w-12 h-12 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-48 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPatients && recentPatients.length > 0 ? (
                <div className="space-y-3">
                  {recentPatients.map((patient, index) => (
                    <Link
                      key={patient.id}
                      href={`/patients/${patient.id}`}
                      className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover-lift border border-transparent hover:border-blue-200 animate-fade-in-up delay-${index * 100}`}
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-semibold">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{patient.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          {patient.email && (
                            <span className="flex items-center gap-1">
                              <Icons.mail className="w-3 h-3" />
                              {patient.email}
                            </span>
                          )}
                          {patient.mobile_number && (
                            <span className="flex items-center gap-1">
                              <Icons.phone className="w-3 h-3" />
                              {patient.mobile_number}
                            </span>
                          )}
                        </div>
                      </div>
                      <Icons.chevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icons.patients className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No recent patients</h3>
                  <p className="text-sm text-gray-500 mb-4">Get started by adding your first patient</p>
                  <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link href="/patients/new">
                      <Icons.add className="w-4 h-4 mr-2" />
                      Add Patient
                    </Link>
                  </Button>
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Quick Actions - 1 column */}
          <EnhancedCard variant="gradient" hover={false}>
            <EnhancedCardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500 mt-1">Common tasks</p>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-3">
                {[
                  { href: '/patients/new', icon: Icons.add, label: 'New Patient', desc: 'Register a new patient' },
                  { href: '/appointments', icon: Icons.appointments, label: 'Schedule', desc: 'Book appointment' },
                  { href: '/prescriptions/new', icon: Icons.pill, label: 'Prescribe', desc: 'Create prescription' },
                  { href: '/medicines', icon: Icons.stethoscope, label: 'Medicines', desc: 'Manage inventory' },
                ].map((action, index) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 hover-lift border border-gray-200 hover:border-blue-300 hover:shadow-md animate-fade-in-up delay-${(index + 3) * 100}`}
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                      <action.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                    <Icons.chevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </SimplePageTransition>
  )
}
