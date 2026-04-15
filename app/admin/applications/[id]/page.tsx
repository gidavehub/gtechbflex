'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, Save, Send } from 'lucide-react';
import CustomTextarea from '@/components/ui/CustomTextarea';
import { useToast } from '@/context/ToastContext';
import { getApplication, updateApplication, getProgram } from '@/lib/firestore';
import type { Application, Program } from '@/lib/types';

export default function AdminApplicationDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [app, setApp] = useState<Application | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await getApplication(id);
      setApp(data);
      if (data) {
        setNotes(data.admin_notes || '');
        const p = await getProgram(data.program_id);
        setProgram(p);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    setSaving(true);
    try {
      await updateApplication(id, { status: status as any, admin_notes: notes });
      setApp(prev => prev ? { ...prev, status: status as any, admin_notes: notes } : null);

      // Send email notification
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
            to: app?.email,
            name: app?.full_name?.split(' ')[0],
            programName: program?.title || 'G-Tech Program',
            reason: notes || undefined,
          }),
        });
      } catch {}

      toast({ title: `Application ${status.replace('_', ' ')}`, type: 'success' });
    } catch {
      toast({ title: 'Error updating', type: 'error' });
    }
    setSaving(false);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateApplication(id, { admin_notes: notes });
      toast({ title: 'Notes saved', type: 'success' });
    } catch {
      toast({ title: 'Error', type: 'error' });
    }
    setSaving(false);
  };

  if (!app) return <div className="py-12 text-center text-sm text-gray-400">Loading...</div>;

  const statusConfig: Record<string, { icon: any; class: string }> = {
    under_review: { icon: Clock, class: 'badge-under-review' },
    accepted: { icon: CheckCircle, class: 'badge-accepted' },
    rejected: { icon: XCircle, class: 'badge-rejected' },
  };

  const current = statusConfig[app.status] || statusConfig.under_review;

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{app.full_name}</h1>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${current.class}`}>
            <current.icon size={14} /> {app.status.replace('_', ' ')}
          </span>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <DetailRow label="Email" value={app.email} />
            <DetailRow label="Phone" value={app.phone} />
            <DetailRow label="Gender" value={app.gender} />
            <DetailRow label="Country" value={app.country} />
            <DetailRow label="Region" value={app.region} />
          </div>
        </div>

        {/* Business */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Business Information</h3>
          <div className="space-y-3">
            <DetailRow label="Business Name" value={app.business_name} />
            <DetailRow label="Sector" value={app.business_sector} />
            <DetailRow label="Formalization" value={app.formalization_status} />
            <DetailRow label="Year Est." value={String(app.year_established || '')} />
            <DetailRow label="Program" value={program?.title || app.program_id} />
          </div>
        </div>
      </div>

      {/* Description of need */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Description of Need</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{app.description_of_need || '—'}</p>
        {app.program_interests?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Program Interests</h4>
            <div className="flex flex-wrap gap-2">
              {app.program_interests.map(i => (
                <span key={i} className="px-3 py-1 rounded-xl bg-gold-50 text-gold-700 border border-gold-200 text-xs font-bold">{i}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin notes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Admin Notes</h3>
        <CustomTextarea label="" value={notes} onChange={setNotes} placeholder="Add notes about this applicant..." rows={3} maxLength={2000} />
        <button onClick={handleSaveNotes} disabled={saving} className="btn-secondary flex items-center gap-2 text-sm mt-3 disabled:opacity-50">
          <Save size={14} /> Save Notes
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => handleStatusChange('accepted')} disabled={saving || app.status === 'accepted'} className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-40">
          <CheckCircle size={18} /> Accept
        </button>
        <button onClick={() => handleStatusChange('rejected')} disabled={saving || app.status === 'rejected'} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-40">
          <XCircle size={18} /> Reject
        </button>
        <button onClick={() => handleStatusChange('under_review')} disabled={saving || app.status === 'under_review'} className="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-40">
          <Clock size={18} /> Under Review
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-gray-900 text-right">{value || '—'}</span>
    </div>
  );
}
