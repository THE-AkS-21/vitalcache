"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Activity, Clock } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { appointmentsApi, Appointment } from '@/lib/api/appointments';
import { useAuthStore } from '@/store/authStore';

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await appointmentsApi.list(5, 0); // Fetch upcoming 5
        setAppointments(res.data);
      } catch (error) {
        console.error("Failed to load appointments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
        >
          <h1 className="text-3xl font-bold text-clay-text">Welcome back, Dr. {user?.last_name || 'Doctor'}</h1>
          <p className="text-gray-500 mt-2">Here is your schedule for today.</p>
        </motion.div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <ClayCard delay={0.1} className="flex items-center space-x-4 border-l-4 border-clay-accent">
            <div className="p-3 bg-indigo-100 text-clay-accent rounded-full">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Today's Appointments</p>
              <h3 className="text-2xl font-bold text-clay-text">12</h3>
            </div>
          </ClayCard>

          <ClayCard delay={0.2} className="flex items-center space-x-4 border-l-4 border-emerald-500">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Patients</p>
              <h3 className="text-2xl font-bold text-clay-text">1,482</h3>
            </div>
          </ClayCard>

          <ClayCard delay={0.3} className="flex items-center space-x-4 border-l-4 border-amber-500">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
              <Activity size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Reports</p>
              <h3 className="text-2xl font-bold text-clay-text">4</h3>
            </div>
          </ClayCard>
        </div>

        {/* UPCOMING APPOINTMENTS LIST */}
        <h2 className="text-xl font-bold text-clay-text mb-6">Upcoming Appointments</h2>
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
              <p className="text-gray-500">Loading schedule...</p>
          ) : appointments.length === 0 ? (
              <ClayCard>
                <p className="text-center text-gray-500 py-8">No appointments scheduled for today.</p>
              </ClayCard>
          ) : (
              appointments.map((apt, index) => (
                  <ClayCard key={apt.id} delay={0.1 * index} className="flex justify-between items-center transition-shadow hover:shadow-clay-hover cursor-pointer">
                    <div className="flex items-center space-x-6">
                      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-3 w-20">
                        <span className="text-sm text-gray-500 uppercase">{new Date(apt.appointment_time).toLocaleString('en-us', { month: 'short' })}</span>
                        <span className="text-xl font-bold text-clay-accent">{new Date(apt.appointment_time).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-clay-text">Patient ID: {apt.patient_id.substring(0, 8)}...</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock size={14} className="mr-1" />
                          {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div>
                <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                    apt.status === 'BOOKED' ? 'bg-indigo-100 text-indigo-700' :
                        apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-red-100 text-red-700'
                }`}>
                  {apt.status}
                </span>
                    </div>
                  </ClayCard>
              ))
          )}
        </div>
      </div>
  );
}