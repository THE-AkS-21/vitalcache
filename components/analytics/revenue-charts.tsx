'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
  AreaChart, Area, RadialBarChart, RadialBar,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsData {
  today_earnings: number;
  today_patients: number;
  weekly_earnings: number;
  weekly_patients: number;
  monthly_earnings: number;
  monthly_patients: number;
  yearly_earnings: number;
  yearly_patients: number;
}

const BRAND_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmt = (v: number) => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtSmall = (v: any) => fmt(Number(v));

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <span className="text-xs text-gray-400">No data</span>;
  if (previous === 0) return <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> New</span>;
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return <span className="text-xs text-gray-400 flex items-center gap-1"><Minus className="w-3 h-3" /> Flat</span>;
  const up = pct > 0;
  return (
    <span className={`text-xs font-semibold flex items-center gap-1 ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function StatCard({ title, value, sub, color, icon }: { title: string; value: string; sub: React.ReactNode; color: string; icon: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border border-white/60 shadow-lg bg-gradient-to-br ${color} text-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <div className="mt-2">{sub}</div>
        </div>
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">{icon}</div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
    </div>
  );
}

const NoData = ({ h = 280 }: { h?: number }) => (
  <div className={`flex flex-col items-center justify-center text-gray-400`} style={{ height: h }}>
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <p className="text-sm font-medium">No data available yet</p>
    <p className="text-xs mt-1">Data will appear here once billing records exist</p>
  </div>
);

export function RevenueCharts({ analytics }: { analytics: AnalyticsData | null }) {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border border-slate-100 shadow-lg bg-white/60 backdrop-blur-xl p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Overview</h3>
          <NoData />
        </div>
        <div className="rounded-2xl border border-slate-100 shadow-lg bg-white/60 backdrop-blur-xl p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Period Breakdown</h3>
          <NoData />
        </div>
      </div>
    );
  }

  const barData = [
    { name: 'Today', revenue: analytics.today_earnings, patients: analytics.today_patients },
    { name: 'This Week', revenue: analytics.weekly_earnings, patients: analytics.weekly_patients },
    { name: 'This Month', revenue: analytics.monthly_earnings, patients: analytics.monthly_patients },
    { name: 'This Year', revenue: analytics.yearly_earnings, patients: analytics.yearly_patients },
  ];

  const areaData = [
    { period: 'Today', amount: analytics.today_earnings },
    { period: 'Week', amount: analytics.weekly_earnings },
    { period: 'Month', amount: analytics.monthly_earnings },
    { period: 'Year', amount: analytics.yearly_earnings },
  ];

  const pieData = [
    { name: 'Today', value: analytics.today_earnings },
    { name: 'Rest of Week', value: Math.max(0, analytics.weekly_earnings - analytics.today_earnings) },
    { name: 'Rest of Month', value: Math.max(0, analytics.monthly_earnings - analytics.weekly_earnings) },
    { name: 'Rest of Year', value: Math.max(0, analytics.yearly_earnings - analytics.monthly_earnings) },
  ].filter(d => d.value > 0);

  const radialData = [
    { name: 'Today', value: analytics.today_patients, fill: '#6366f1' },
    { name: 'Weekly', value: analytics.weekly_patients, fill: '#10b981' },
    { name: 'Monthly', value: analytics.monthly_patients, fill: '#f59e0b' },
  ];

  const hasRevData = barData.some(d => d.revenue > 0);
  const hasPieData = pieData.length > 0;
  const hasPatientData = analytics.today_patients > 0 || analytics.weekly_patients > 0 || analytics.monthly_patients > 0;

  const tooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 4px 20px -4px rgba(0,0,0,0.15)',
    fontSize: '13px',
  };

  return (
    <div className="space-y-6 mt-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={fmt(analytics.today_earnings)}
          sub={<TrendBadge current={analytics.today_earnings} previous={0} />}
          color="from-indigo-500 to-indigo-700"
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Weekly Revenue"
          value={fmt(analytics.weekly_earnings)}
          sub={<TrendBadge current={analytics.weekly_earnings} previous={analytics.today_earnings} />}
          color="from-emerald-500 to-emerald-700"
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <StatCard
          title="Monthly Revenue"
          value={fmt(analytics.monthly_earnings)}
          sub={<TrendBadge current={analytics.monthly_earnings} previous={analytics.weekly_earnings} />}
          color="from-amber-500 to-orange-600"
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          title="Yearly Revenue"
          value={fmt(analytics.yearly_earnings)}
          sub={<TrendBadge current={analytics.yearly_earnings} previous={analytics.monthly_earnings} />}
          color="from-purple-500 to-purple-700"
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
      </div>

      {/* Charts Row 1: Bar + Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <div className="rounded-2xl border border-slate-100 shadow-lg bg-white/70 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-800">Revenue by Period</h3>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Revenue</span>
          </div>
          {!hasRevData ? <NoData /> : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={fmtSmall} dx={-5} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt(Number(v)), 'Revenue']} />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Revenue Area Chart */}
        <div className="rounded-2xl border border-slate-100 shadow-lg bg-white/70 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-800">Revenue Trend</h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Cumulative</span>
          </div>
          {!hasRevData ? <NoData /> : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={fmtSmall} dx={-5} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt(Number(v)), 'Revenue']} />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Pie + Radial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Distribution Pie */}
        <div className="rounded-2xl border border-slate-100 shadow-lg bg-white/70 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-800">Revenue Distribution</h3>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Breakdown</span>
          </div>
          {!hasPieData ? <NoData /> : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt(Number(v)), 'Revenue']} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ color: '#64748b', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Patient Volume Radial */}
        <div className="rounded-2xl border border-slate-100 shadow-lg bg-white/70 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-800">Patient Volume</h3>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Patients</span>
          </div>
          {!hasPatientData ? <NoData /> : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={110}
                  barSize={16}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={8}
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 600 }}
                    background={{ fill: '#f8fafc' }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: any, name: any, props: any) => [v, props?.payload?.name ?? name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ color: '#64748b', fontSize: 12 }}>{value}</span>}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
