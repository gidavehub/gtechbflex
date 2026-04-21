'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Download, FileText } from 'lucide-react';
import { getApplications } from '@/lib/firestore';
import type { Application } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

const statusColors: Record<string, string> = {
  under_review: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-600',
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

function getApplicantBusiness(app: Application): string {
  return app.answers?.business_name || app.business_name || '';
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const a = await getApplications();
        setApps(a);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = apps;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => {
        const name = getApplicantName(a).toLowerCase();
        const email = getApplicantEmail(a).toLowerCase();
        const business = getApplicantBusiness(a).toLowerCase();
        return name.includes(q) || email.includes(q) || business.includes(q);
      });
    }
    if (statusFilter) result = result.filter(a => a.status === statusFilter);
    if (typeFilter) result = result.filter(a => a.program_type === typeFilter);
    return result;
  }, [apps, search, statusFilter, typeFilter]);

  const handleExport = () => {
    // Gather all unique answer keys across all applications
    const allKeys = new Set<string>();
    filtered.forEach(a => {
      if (a.answers) {
        Object.keys(a.answers).forEach(k => allKeys.add(k));
      }
    });
    const dynamicKeys = Array.from(allKeys);

    const headers = ['Name', 'Email', 'Business', 'Program Type', 'Status', 'Date', ...dynamicKeys.map(k => k.replace(/_/g, ' '))];
    const rows = filtered.map(a => {
      const base = [
        getApplicantName(a),
        getApplicantEmail(a),
        getApplicantBusiness(a),
        TYPE_LABELS[a.program_type] || a.program_type || '',
        a.status,
        a.created_at?.toDate ? new Date(a.created_at.toDate()).toLocaleDateString() : '',
      ];
      const dynamic = dynamicKeys.map(k => {
        const val = a.answers?.[k];
        if (Array.isArray(val)) return val.join('; ');
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        return String(val ?? '');
      });
      return [...base, ...dynamic];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bflex-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Get unique program types from applications
  const availableTypes = useMemo(() => {
    const types = new Set(apps.map(a => a.program_type).filter(Boolean));
    return Array.from(types);
  }, [apps]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500">{filtered.length} total</p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center bg-white rounded-2xl border border-gray-200 px-4 focus-within:border-gold-400 transition-all">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, business..." className="flex-1 px-3 py-3 text-sm outline-none bg-transparent" />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filters */}
          {['', 'under_review', 'accepted', 'rejected'].map(s => (
            <button
              key={`status-${s}`}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}

          {/* Divider */}
          {availableTypes.length > 0 && (
            <div className="w-px bg-gray-200 mx-1 self-stretch" />
          )}

          {/* Program type filters */}
          {availableTypes.map(t => (
            <button
              key={`type-${t}`}
              onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${typeFilter === t ? 'bg-gold-400 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center"><FileText size={32} className="mx-auto text-gray-300 mb-3" /><p className="text-sm text-gray-400">No applications found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Applicant</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Business</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Program Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const name = getApplicantName(app);
                  const email = getApplicantEmail(app);
                  const business = getApplicantBusiness(app);
                  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr key={app.id} onClick={() => router.push(`/admin/applications/${app.id}`)} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 font-bold text-xs border border-gold-200">{initials}</div>
                          <div><p className="font-semibold text-gray-900">{name}</p><p className="text-xs text-gray-400">{email}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{business || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-gold-50 text-gold-600 border border-gold-200">
                          {TYPE_LABELS[app.program_type] || app.program_type || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[app.status]}`}>{app.status?.replace('_', ' ')}</span></td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{app.created_at?.toDate ? new Date(app.created_at.toDate()).toLocaleDateString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
