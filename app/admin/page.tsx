'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FileText, GraduationCap, Clock, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { getApplications } from '@/lib/firestore';
import type { Application } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

function getApplicantName(app: Application): string {
  if (app.answers?.full_name) return app.answers.full_name;
  if (app.answers?.name) return app.answers.name;
  if (app.full_name) return app.full_name;
  if (app.answers) {
    for (const [key, val] of Object.entries(app.answers)) {
      if ((key.includes('name') || key.includes('Name')) && typeof val === 'string') return val;
    }
  }
  return 'Unnamed';
}

function getApplicantEmail(app: Application): string {
  return app.answers?.email || app.email || '';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const a = await getApplications();
        setApps(a);
      } catch {}
    };
    load();
  }, []);

  const underReview = apps.filter(a => a.status === 'under_review').length;
  const accepted = apps.filter(a => a.status === 'accepted').length;

  // Count unique program types
  const programTypes = new Set(apps.map(a => a.program_type).filter(Boolean));

  const statusColors: Record<string, string> = {
    under_review: 'bg-amber-100 text-amber-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-600',
  };

  const cards = [
    { label: 'Total Applications', value: apps.length, icon: FileText, gradient: 'from-gold-400 to-gold-500', link: '/admin/applications', desc: 'All submissions' },
    { label: 'Pending Review', value: underReview, icon: Clock, gradient: 'from-red-500 to-red-600', link: '/admin/applications', desc: 'Awaiting action' },
    { label: 'Program Types', value: programTypes.size, icon: GraduationCap, gradient: 'from-blue-500 to-blue-600', link: '/admin/applications', desc: 'Active categories' },
    { label: 'Accepted', value: accepted, icon: Users, gradient: 'from-emerald-500 to-emerald-600', link: '/admin/analytics', desc: 'Accepted applicants' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">Admin Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome Back 👋</h1>
          <p className="text-sm text-white/60">
            You have <span className="text-gold-400 font-bold">{underReview} under review</span> application{underReview !== 1 ? 's' : ''} to process.
          </p>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div
              onClick={() => router.push(card.link)}
              className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-gold-200/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                  <card.icon size={20} className="text-white" />
                </div>
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm font-semibold text-gray-700">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent applications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gold-500" />
              <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
            </div>
            <button onClick={() => router.push('/admin/applications')} className="text-xs font-semibold text-gold-500 hover:text-gold-600 flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            {apps.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">No applications yet.</div>
            ) : (
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Program Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.slice(0, 8).map((app, idx) => {
                    const name = getApplicantName(app);
                    const email = getApplicantEmail(app);
                    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                    return (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.05 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/applications/${app.id}`)}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 font-bold text-xs border border-gold-200">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{name}</p>
                              <p className="text-xs text-gray-400">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-gold-50 text-gold-600 border border-gold-200">
                            {TYPE_LABELS[app.program_type] || app.program_type || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[app.status] || statusColors.under_review}`}>
                            {app.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-400">
                          {app.created_at?.toDate ? new Date(app.created_at.toDate()).toLocaleDateString() : '—'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
