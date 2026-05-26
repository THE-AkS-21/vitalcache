/**
 * Dashboard Page — Server Component
 *
 * Performance changes:
 * ✅ No 'use client' — this is now an async Server Component
 * ✅ framer-motion removed — replaced with CSS animations (already in globals.css)
 * ✅ ClayCard removed — it was a missing import causing the build failure
 * ✅ useEffect/useState data fetch removed — data is now fetched server-side
 *    and passed down as props to the client island (DashboardStats)
 * ✅ useAuthStore replaced — user is passed as prop from server (no Zustand on server)
 *
 * Architecture:
 *   DashboardPage (RSC) → fetches appointments on server
 *     └── DashboardStats (RSC) → renders stat cards (pure HTML, no JS)
 *     └── AppointmentList (RSC) → renders appointments (pure HTML, no JS)
 *
 * No React Query here — React Query is for CLIENT data fetching.
 * Server-side data fetching uses native fetch() with Next.js caching.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Users, Calendar, Activity, Clock, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import { RevenueCharts } from '@/components/analytics/revenue-charts';

const GO_API = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface Appointment {
  id: string;
  patient_id: string;
  appointment_time: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

interface AppointmentListResponse {
  data: Appointment[];
  meta: { total: number };
}

/**
 * getAppointments fetches a paginated list of appointments from the backend for the dashboard.
 * It uses native fetch with Next.js caching to revalidate data periodically.
 * 
 * @param {string} accessToken - The user's JWT access token.
 * @returns {Promise<AppointmentListResponse>} A promise resolving to the list of appointments.
 */
async function getAppointments(accessToken: string): Promise<AppointmentListResponse> {
  try {
    const res = await fetch(`${GO_API}/appointments?limit=5&offset=0`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return { data: [], meta: { total: 0 } };
    return (await res.json()) as { data: Appointment[]; meta: { total: number } };
  } catch {
    return { data: [], meta: { total: 0 } };
  }
}

/**
 * getPatients fetches a paginated list of patients from the backend to get the total patient count.
 * 
 * @param {string} accessToken - The user's JWT access token.
 * @returns {Promise<{ meta: { total: number } }>} A promise resolving to the patients metadata.
 */
async function getPatients(accessToken: string): Promise<{ meta: { total: number } }> {
  try {
    const res = await fetch(`${GO_API}/patients?limit=1&offset=0`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return { meta: { total: 0 } };
    const json = await res.json();
    return { meta: json.meta ?? { total: 0 } };
  } catch {
    return { meta: { total: 0 } };
  }
}

/**
 * getAnalytics fetches revenue and consultation analytics data from the backend.
 * 
 * @param {string} accessToken - The user's JWT access token.
 * @returns {Promise<any>} A promise resolving to the analytics data or null on error.
 */
async function getAnalytics(accessToken: string) {
  try {
    const res = await fetch(`${GO_API}/billings/analytics`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function StatusBadge({ status }: { status: Appointment['status'] }) {
  const styles = {
    BOOKED: 'bg-indigo-100 text-indigo-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  } as const;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

/**
 * DashboardPage is the main Server Component for the authenticated dashboard.
 * It retrieves the user's access token via a server-to-server refresh token exchange,
 * concurrently fetches appointments, patients, and analytics data, and renders 
 * the top-level KPIs, charts, and upcoming appointments list without requiring client-side JS for fetching.
 * 
 * @returns React.JSX element for the dashboard page.
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  let accessToken = '';
  if (refreshToken) {
    try {
      const sessionRes = await fetch(`${GO_API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `refresh_token=${refreshToken}` },
        body: JSON.stringify({}),
        cache: 'no-store',
      });
      if (sessionRes.ok) {
        const sessionData = (await sessionRes.json()) as { data: { access_token: string } };
        accessToken = sessionData.data.access_token;
      } else if (sessionRes.status === 401) {
        redirect('/api/auth/logout');
      }
    } catch {}
  } else {
    redirect('/api/auth/logout');
  }

  const [appointmentsRes, patientsRes, analytics] = await Promise.all([
    getAppointments(accessToken),
    getPatients(accessToken),
    getAnalytics(accessToken)
  ]);

  const appointments = appointmentsRes.data;
  const totalAppointments = appointmentsRes.meta.total;
  const totalPatients = patientsRes.meta.total;
  const pendingReports = appointments.filter(a => a.status === 'BOOKED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your clinic overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="clay-card-elevated p-6 flex items-center space-x-4 border-l-4 border-l-indigo-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Today&apos;s Appointments</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalAppointments}</h3>
          </div>
        </div>

        <div className="clay-card-elevated p-6 flex items-center space-x-4 border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalPatients}</h3>
          </div>
        </div>

        <div className="clay-card-elevated p-6 flex items-center space-x-4 border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Reports</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingReports}</h3>
          </div>
        </div>

        <div className="clay-card-elevated p-6 flex items-center space-x-4 border-l-4 border-l-green-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <DollarSign className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Today&apos;s Earnings</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {analytics ? `₹${(analytics.today_earnings || 0).toLocaleString('en-IN')}` : '₹0'}
            </h3>
          </div>
        </div>
      </div>

      {/* Analytics & Revenue Charts — always render, shows empty state when no data */}
      <RevenueCharts analytics={analytics} />

      <div className="grid grid-cols-1 gap-6">
        <ActivityHeatmap />
      </div>

      {/* Upcoming Appointments — pure RSC, zero JS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
          <Link
            href="/appointments"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="clay-card overflow-hidden">
          {appointments.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No upcoming appointments</p>
              <p className="text-gray-400 text-sm mt-1">New appointments will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex justify-between items-center p-5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-3 w-16 flex-shrink-0">
                      <span className="text-xs text-gray-500 uppercase font-medium">
                        {new Date(apt.appointment_time).toLocaleString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold text-indigo-600">
                        {new Date(apt.appointment_time).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Patient #{apt.patient_id.substring(0, 8)}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-0.5">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}