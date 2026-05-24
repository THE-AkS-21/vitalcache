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
import { Users, Calendar, Activity, Clock } from 'lucide-react';
import Link from 'next/link';

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

async function getAppointments(accessToken: string): Promise<AppointmentListResponse> {
  try {
    const res = await fetch(`${GO_API}/api/v1/appointments?limit=5&offset=0`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      // Cache for 30 seconds — revalidate on next request after that
      next: { revalidate: 30 },
    });
    if (!res.ok) return { data: [], meta: { total: 0 } };
    const json = (await res.json()) as { data: Appointment[]; meta: { total: number } };
    return json;
  } catch {
    return { data: [], meta: { total: 0 } };
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

export default async function DashboardPage() {
  // Read access token from the session cookie route — server-side only
  // In RSC we cannot call Zustand; we read the session via cookies
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  // Fetch a fresh access token server-side to call the Go API
  let accessToken = '';
  if (refreshToken) {
    try {
      const sessionRes = await fetch(`${GO_API}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `refresh_token=${refreshToken}` },
        body: JSON.stringify({}),
        cache: 'no-store',
      });
      if (sessionRes.ok) {
        const sessionData = (await sessionRes.json()) as { data: { access_token: string } };
        accessToken = sessionData.data.access_token;
      }
    } catch {
      // Could not refresh — render with empty data, client-side will handle auth
    }
  }

  const { data: appointments, meta } = await getAppointments(accessToken);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your clinic overview for today.</p>
      </div>

      {/* Stats Grid — pure RSC, zero JS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-lg p-6 flex items-center space-x-4 border-l-4 border-l-indigo-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Today&apos;s Appointments</p>
            <h3 className="text-2xl font-bold text-gray-900">{meta.total}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-lg p-6 flex items-center space-x-4 border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <h3 className="text-2xl font-bold text-gray-900">—</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-lg p-6 flex items-center space-x-4 border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Reports</p>
            <h3 className="text-2xl font-bold text-gray-900">—</h3>
          </div>
        </div>
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

        <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-lg overflow-hidden">
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