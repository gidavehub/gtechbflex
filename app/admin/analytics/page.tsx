'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, PieChart as PieChartIcon, DollarSign, Layers,
  Users, Globe, Briefcase, ArrowUpRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  RadialBarChart, RadialBar,
} from 'recharts';
import { getApplications } from '@/lib/firestore';
import type { Application } from '@/lib/types';

// ==========================================
// Constants
// ==========================================
const TYPE_LABELS: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

const STATUS_LABELS: Record<string, string> = {
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const PALETTE = ['#D4A843', '#3B82F6', '#10B981', '#8B5CF6', '#F43F5E', '#F97316', '#06B6D4', '#EC4899', '#6366F1', '#14B8A6'];
const STATUS_COLORS: Record<string, string> = {
  'Under Review': '#F59E0B',
  'Accepted': '#10B981',
  'Rejected': '#EF4444',
  'Withdrawn': '#9CA3AF',
};
const PROGRAM_COLORS: Record<string, string> = {
  'Mentorship': '#8B5CF6',
  'Investment Readiness': '#10B981',
  'Business Linkage': '#F59E0B',
  'Incubation': '#3B82F6',
  'Acceleration': '#F43F5E',
};

// ==========================================
// Custom Tooltip
// ==========================================
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold border border-gray-700">
      {label && <p className="text-gray-400 mb-1 text-[10px] uppercase tracking-wider">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span>{p.name || p.dataKey}: <strong>{p.value}</strong></span>
        </p>
      ))}
    </div>
  );
}

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ==========================================
// Main Component
// ==========================================
export default function AnalyticsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { setApps(await getApplications()); } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // ---- Data helpers ----
  const countByAnswer = (key: string): Record<string, number> => {
    return apps.reduce((acc, app) => {
      const val = app.answers?.[key] || (app as any)[key];
      if (!val || val === '') return acc;
      acc[String(val)] = (acc[String(val)] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const countByField = (key: string, labelMap?: Record<string, string>): Record<string, number> => {
    return apps.reduce((acc, app) => {
      const val = (app as any)[key];
      if (!val || val === '') return acc;
      const label = labelMap ? (labelMap[val] || val) : String(val);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const toChartData = (dist: Record<string, number>) =>
    Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

  // ---- Distributions ----
  const genderDist = countByAnswer('gender');
  const countryDist = countByAnswer('country');
  const sectorDist = countByAnswer('business_sector');
  const formalizationDist = countByAnswer('formalization');
  const revenueDist = countByAnswer('revenue_model');
  const annualRevenueDist = countByAnswer('annual_revenue');
  const raisedFundsDist = countByAnswer('has_raised_funds');
  const wantsToRaiseDist = countByAnswer('wants_to_raise_funds');
  const statusDist = countByField('status', STATUS_LABELS);
  const programTypeDist = countByField('program_type', TYPE_LABELS);

  // ---- Chart data ----
  const statusData = toChartData(statusDist);
  const programData = toChartData(programTypeDist);
  const genderData = toChartData(genderDist);
  const countryData = toChartData(countryDist);
  const sectorData = toChartData(sectorDist);
  const formalizationData = toChartData(formalizationDist);
  const revenueData = toChartData(revenueDist);
  const annualRevenueData = toChartData(annualRevenueDist);
  const raisedFundsData = toChartData(raisedFundsDist);
  const wantsToRaiseData = toChartData(wantsToRaiseDist);

  // Timeline data
  const timelineData = useMemo(() => {
    const months: Record<string, number> = {};
    apps.forEach(app => {
      if (app.created_at?.toDate) {
        const d = new Date(app.created_at.toDate());
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        months[label] = (months[label] || 0) + 1;
      }
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [apps]);

  // Radar data for program type comparison
  const radarData = useMemo(() => {
    return Object.entries(TYPE_LABELS).map(([key, label]) => {
      const typeApps = apps.filter(a => a.program_type === key);
      return {
        subject: label.split(' ')[0],
        total: typeApps.length,
        accepted: typeApps.filter(a => a.status === 'accepted').length,
        pending: typeApps.filter(a => a.status === 'under_review').length,
      };
    });
  }, [apps]);

  // Radial bar for status overview
  const radialData = useMemo(() => {
    const total = apps.length || 1;
    return [
      { name: 'Accepted', value: apps.filter(a => a.status === 'accepted').length, fill: '#10B981' },
      { name: 'Under Review', value: apps.filter(a => a.status === 'under_review').length, fill: '#F59E0B' },
      { name: 'Rejected', value: apps.filter(a => a.status === 'rejected').length, fill: '#EF4444' },
    ];
  }, [apps]);

  const totalApps = apps.length;
  const hasBusinessData = sectorData.length > 0 || revenueData.length > 0;

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div><h1 className="text-xl font-bold text-gray-900">Analytics</h1></div>
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-2xl h-64 animate-shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">{totalApps} total applications analyzed</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Applications" value={totalApps} icon={BarChart3} color="from-gold-400 to-gold-500" />
        <MetricCard label="Program Types" value={Object.keys(programTypeDist).length} icon={Layers} color="from-blue-500 to-indigo-600" />
        <MetricCard label="Countries" value={Object.keys(countryDist).length} icon={Globe} color="from-emerald-500 to-teal-600" />
        <MetricCard label="Business Sectors" value={Object.keys(sectorDist).length} icon={Briefcase} color="from-violet-500 to-purple-600" />
      </div>

      {/* Row 1: Status + Program Type */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Status Donut */}
        <ChartCard title="Application Status" icon={PieChartIcon}>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {statusData.map((entry, idx) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-xs font-semibold text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <NoData />}
        </ChartCard>

        {/* Program Type Bar Chart */}
        <ChartCard title="Applications by Program" icon={Layers}>
          {programData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={programData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} width={110} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {programData.map((entry, idx) => (
                    <Cell key={entry.name} fill={PROGRAM_COLORS[entry.name] || PALETTE[idx % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <NoData />}
        </ChartCard>
      </div>

      {/* Row 2: Radar + Radial */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Radar: program type comparison */}
        <ChartCard title="Program Comparison" icon={TrendingUp}>
          {radarData.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} />
                <Radar name="Total" dataKey="total" stroke="#D4A843" fill="#D4A843" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Accepted" dataKey="accepted" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Pending" dataKey="pending" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs font-semibold text-gray-600">{value}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <NoData />}
        </ChartCard>

        {/* Radial bar: Status overview */}
        <ChartCard title="Status Overview" icon={BarChart3}>
          {radialData.some(d => d.value > 0) ? (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    background={{ fill: '#f3f4f6' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-2">
                {radialData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-xs font-semibold text-gray-600">{d.name}: <strong className="text-gray-900">{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          ) : <NoData />}
        </ChartCard>
      </div>

      {/* Row 3: Demographics */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Gender Pie */}
        <ChartCard title="Gender Distribution" icon={Users}>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" outerRadius={95} dataKey="value" labelLine={false} label={CustomPieLabel} paddingAngle={3}>
                  {genderData.map((_, idx) => <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs font-semibold text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <NoData />}
        </ChartCard>

        {/* Country Bar */}
        <ChartCard title="Country Distribution" icon={Globe}>
          {countryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={countryData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                  {countryData.map((_, idx) => <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <NoData />}
        </ChartCard>
      </div>

      {/* Timeline */}
      {timelineData.length > 0 && (
        <ChartCard title="Applications Over Time" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timelineData} margin={{ left: 0, right: 10, top: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A843" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#D4A843" strokeWidth={3} fill="url(#goldGradient)" dot={{ fill: '#D4A843', stroke: '#fff', strokeWidth: 2, r: 5 }} activeDot={{ r: 7, stroke: '#D4A843', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Business Insights Section */}
      {hasBusinessData && (
        <>
          <div className="flex items-center gap-2 pt-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <DollarSign size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Business Insights</h2>
              <p className="text-xs text-gray-400">Data from business-linked program applications</p>
            </div>
          </div>

          {/* Sector + Formalization */}
          <div className="grid md:grid-cols-2 gap-5">
            <ChartCard title="Business Sector" icon={Briefcase}>
              {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={sectorData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} width={100} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                      {sectorData.map((_, idx) => <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>

            <ChartCard title="Formalization Status" icon={PieChartIcon}>
              {formalizationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={formalizationData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={5} labelLine={false} label={CustomPieLabel}>
                      {formalizationData.map((_, idx) => <Cell key={idx} fill={idx === 0 ? '#D4A843' : '#6B7280'} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs font-semibold text-gray-600">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>
          </div>

          {/* Revenue Model + Annual Revenue */}
          <div className="grid md:grid-cols-2 gap-5">
            <ChartCard title="Revenue Model" icon={DollarSign}>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={revenueData} cx="50%" cy="50%" outerRadius={95} dataKey="value" paddingAngle={2} labelLine={false} label={CustomPieLabel}>
                      {revenueData.map((_, idx) => <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs font-semibold text-gray-600">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>

            <ChartCard title="Annual Revenue" icon={TrendingUp}>
              {annualRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={annualRevenueData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={28}>
                      {annualRevenueData.map((_, idx) => <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>
          </div>

          {/* Fundraising */}
          <div className="grid md:grid-cols-2 gap-5">
            <ChartCard title="Have Raised Funds?" icon={DollarSign}>
              {raisedFundsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={raisedFundsData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={6} labelLine={false} label={CustomPieLabel}>
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs font-semibold text-gray-600">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>

            <ChartCard title="Want to Raise Funds?" icon={TrendingUp}>
              {wantsToRaiseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={wantsToRaiseData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={6} labelLine={false} label={CustomPieLabel}>
                      <Cell fill="#3B82F6" />
                      <Cell fill="#9CA3AF" />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs font-semibold text-gray-600">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// Metric Card
// ==========================================
function MetricCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm mb-3`}>
          <Icon size={18} className="text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
      </div>
    </motion.div>
  );
}

// ==========================================
// Chart Card Wrapper
// ==========================================
function ChartCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Icon size={16} className="text-gold-500" />{title}
      </h3>
      {children}
    </motion.div>
  );
}

function NoData() {
  return <p className="text-sm text-gray-400 text-center py-12">No data available yet</p>;
}
