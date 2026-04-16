'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, Save } from 'lucide-react';
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

      // Send email notification via the applicant's email from answers or legacy field
      const email = app?.answers?.email || app?.email;
      const name = app?.answers?.full_name || app?.full_name;

      if (email) {
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
              to: email,
              name: name?.split(' ')[0] || 'Applicant',
              programName: program?.title || 'G-Tech Program',
              reason: notes || undefined,
            }),
          });
        } catch {}
      }

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

  // Determine if this is a new-format (dynamic answers) or old-format (legacy fields) application
  const hasAnswers = app.answers && Object.keys(app.answers).length > 0;
  const formFields = program?.fields || [];

  // Build display data
  const displayRows: { label: string; value: string }[] = [];

  if (hasAnswers) {
    // New format: use program form fields for labels, answers for values
    formFields.forEach(field => {
      if (field.type === 'heading' || field.type === 'paragraph') return;
      let val = app.answers[field.id];
      if (val === undefined || val === null) return;
      if (Array.isArray(val)) val = val.join(', ');
      if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
      displayRows.push({ label: field.label, value: String(val) });
    });

    // Also show any answers without matching form field (in case form was changed)
    Object.entries(app.answers).forEach(([key, val]) => {
      if (formFields.some(f => f.id === key)) return; // Already shown
      if (val === undefined || val === null) return;
      if (Array.isArray(val)) val = val.join(', ');
      if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
      displayRows.push({ label: key.replace(/_/g, ' '), value: String(val) });
    });
  } else {
    // Legacy format: hardcoded fields
    if (app.full_name) displayRows.push({ label: 'Full Name', value: app.full_name });
    if (app.email) displayRows.push({ label: 'Email', value: app.email });
    if (app.phone) displayRows.push({ label: 'Phone', value: app.phone });
    if (app.gender) displayRows.push({ label: 'Gender', value: app.gender });
    if (app.country) displayRows.push({ label: 'Country', value: app.country });
    if (app.region) displayRows.push({ label: 'Region', value: app.region });
    if (app.business_name) displayRows.push({ label: 'Business Name', value: app.business_name });
    if (app.business_sector) displayRows.push({ label: 'Business Sector', value: app.business_sector });
    if (app.formalization_status) displayRows.push({ label: 'Formalization', value: app.formalization_status });
    if (app.year_established) displayRows.push({ label: 'Year Established', value: String(app.year_established) });
    if (app.description_of_need) displayRows.push({ label: 'Description of Need', value: app.description_of_need });
    if (app.program_interests?.length) displayRows.push({ label: 'Program Interests', value: app.program_interests.join(', ') });
  }

  // Get applicant name for the header
  const applicantName = hasAnswers
    ? (app.answers.full_name || app.answers.name || Object.values(app.answers)[0] || 'Unnamed')
    : (app.full_name || 'Unnamed');

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{applicantName}</h1>
            {program && <p className="text-xs text-gray-400 mt-0.5">Applied to: {program.title}</p>}
          </div>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${current.class}`}>
            <current.icon size={14} /> {app.status.replace('_', ' ')}
          </span>
        </div>
      </motion.div>

      {/* Application answers */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Application Details</h3>
        <div className="space-y-3">
          {displayRows.map((row, idx) => (
            <div key={idx} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{row.label}</span>
              <span className="text-sm font-bold text-gray-900 text-right max-w-[60%] whitespace-pre-wrap">{row.value || '—'}</span>
            </div>
          ))}
          {displayRows.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No application data found.</p>
          )}
        </div>
      </div>

      {/* Submitted date */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted</span>
          <span className="text-sm font-bold text-gray-900">
            {app.created_at?.toDate ? new Date(app.created_at.toDate()).toLocaleString() : '—'}
          </span>
        </div>
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
