'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Download, FileText, Filter } from 'lucide-react';
import { getApplications, getPrograms } from '@/lib/firestore';
import type { Application, Program } from '@/lib/types';

const statusColors: Record<string, string> = {
  under_review: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-600',
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, p] = await Promise.all([getApplications(), getPrograms()]);
        setApps(a);
        setPrograms(p);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = apps;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => a.full_name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.business_name?.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter(a => a.status === statusFilter);
    return result;
  }, [apps, search, statusFilter]);

  const getProgramTitle = (id: string) => programs.find(p => p.id === id)?.title || '—';

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Phone', 'Gender', 'Country', 'Region', 'Business', 'Sector', 'Status', 'Date'];
    const rows = filtered.map(a => [
      a.full_name, a.email, a.phone, a.gender, a.country, a.region,
      a.business_name, a.business_sector, a.status,
      a.created_at?.toDate ? new Date(a.created_at.toDate()).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bflex-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

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
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center bg-white rounded-2xl border border-gray-200 px-4 focus-within:border-gold-400 transition-all">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, business..." className="flex-1 px-3 py-3 text-sm outline-none bg-transparent" />
        </div>
        <div className="flex gap-2">
          {['', 'under_review', 'accepted', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s ? s.replace('_', ' ') : 'All'}
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
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Program</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, idx) => (
                  <tr key={app.id} onClick={() => router.push(`/admin/applications/${app.id}`)} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 font-bold text-xs border border-gold-200">{app.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div><p className="font-semibold text-gray-900">{app.full_name}</p><p className="text-xs text-gray-400">{app.email}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{app.business_name || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{getProgramTitle(app.program_id)}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[app.status]}`}>{app.status?.replace('_', ' ')}</span></td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{app.created_at?.toDate ? new Date(app.created_at.toDate()).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
