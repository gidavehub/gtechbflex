'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, Save, User, Briefcase, DollarSign, MessageSquare } from 'lucide-react';
import CustomTextarea from '@/components/ui/CustomTextarea';
import { useToast } from '@/context/ToastContext';
import { getApplication, updateApplication } from '@/lib/firestore';
import { DEFAULT_FORM_FIELDS } from '@/lib/types';
import type { Application } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

// Group field IDs into logical sections for display
const SECTION_CONFIG = [
  {
    title: 'Personal Information',
    icon: User,
    fieldIds: ['full_name', 'email', 'phone', 'gender', 'country'],
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    title: 'Business Ownership',
    icon: Briefcase,
    fieldIds: ['has_business'],
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  {
    title: 'Business Information',
    icon: Briefcase,
    fieldIds: ['business_name', 'business_sector', 'formalization'],
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    title: 'Business Details',
    icon: DollarSign,
    fieldIds: ['revenue_model', 'annual_revenue', 'has_raised_funds', 'wants_to_raise_funds'],
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Motivation',
    icon: MessageSquare,
    fieldIds: ['description'],
    color: 'text-gold-500',
    bg: 'bg-gold-50',
  },
];

export default function AdminApplicationDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [app, setApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await getApplication(id);
      setApp(data);
      if (data) {
        setNotes(data.admin_notes || '');
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
      const typeLabel = TYPE_LABELS[app?.program_type || ''] || app?.program_type || 'G-Tech Program';

      if (email) {
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
              to: email,
              name: name?.split(' ')[0] || 'Applicant',
              programName: `G-Tech ${typeLabel}`,
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

  // Build display data by sections
  const hasAnswers = app.answers && Object.keys(app.answers).length > 0;
  const formFields = DEFAULT_FORM_FIELDS;

  // Build sectioned display
  const sections: { title: string; icon: any; color: string; bg: string; rows: { label: string; value: string }[] }[] = [];
  const shownFieldIds = new Set<string>();

  if (hasAnswers) {
    SECTION_CONFIG.forEach(section => {
      const rows: { label: string; value: string }[] = [];
      section.fieldIds.forEach(fieldId => {
        let val = app.answers[fieldId];
        if (val === undefined || val === null || val === '') return;
        if (Array.isArray(val)) val = val.join(', ');
        if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
        // Get label from form field definition
        const fieldDef = formFields.find(f => f.id === fieldId);
        const label = fieldDef ? fieldDef.label : fieldId.replace(/_/g, ' ');
        rows.push({ label, value: String(val) });
        shownFieldIds.add(fieldId);
      });
      if (rows.length > 0) {
        sections.push({ ...section, rows });
      }
    });

    // Catch any answers not in our section config
    const extraRows: { label: string; value: string }[] = [];
    Object.entries(app.answers).forEach(([key, val]) => {
      if (shownFieldIds.has(key)) return;
      if (val === undefined || val === null || val === '') return;
      if (Array.isArray(val)) val = val.join(', ');
      if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
      const fieldDef = formFields.find(f => f.id === key);
      const label = fieldDef ? fieldDef.label : key.replace(/_/g, ' ');
      extraRows.push({ label, value: String(val) });
    });
    if (extraRows.length > 0) {
      sections.push({ title: 'Other Information', icon: User, color: 'text-gray-500', bg: 'bg-gray-50', rows: extraRows });
    }
  } else {
    // Legacy format
    const legacyRows: { label: string; value: string }[] = [];
    if (app.full_name) legacyRows.push({ label: 'Full Name', value: app.full_name });
    if (app.email) legacyRows.push({ label: 'Email', value: app.email });
    if (app.phone) legacyRows.push({ label: 'Phone', value: app.phone });
    if (app.gender) legacyRows.push({ label: 'Gender', value: app.gender });
    if (app.country) legacyRows.push({ label: 'Country', value: app.country });
    if (app.region) legacyRows.push({ label: 'Region', value: app.region });
    if (app.business_name) legacyRows.push({ label: 'Business Name', value: app.business_name });
    if (app.business_sector) legacyRows.push({ label: 'Business Sector', value: app.business_sector });
    if (app.formalization_status) legacyRows.push({ label: 'Formalization', value: app.formalization_status });
    if (app.year_established) legacyRows.push({ label: 'Year Established', value: String(app.year_established) });
    if (app.description_of_need) legacyRows.push({ label: 'Description of Need', value: app.description_of_need });
    if (app.program_interests?.length) legacyRows.push({ label: 'Program Interests', value: app.program_interests.join(', ') });
    if (legacyRows.length > 0) {
      sections.push({ title: 'Application Details', icon: User, color: 'text-gold-500', bg: 'bg-gold-50', rows: legacyRows });
    }
  }

  // Get applicant name for the header
  const applicantName = hasAnswers
    ? (app.answers.full_name || app.answers.name || Object.values(app.answers)[0] || 'Unnamed')
    : (app.full_name || 'Unnamed');

  const typeLabel = TYPE_LABELS[app.program_type] || app.program_type;

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{applicantName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-gold-50 text-gold-600 border border-gold-200">
                {typeLabel}
              </span>
              <span className="text-xs text-gray-400">
                {app.created_at?.toDate ? new Date(app.created_at.toDate()).toLocaleString() : '—'}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${current.class}`}>
            <current.icon size={14} /> {app.status.replace('_', ' ')}
          </span>
        </div>
      </motion.div>

      {/* Application sections */}
      {sections.map((section, sIdx) => {
        const SectionIcon = section.icon;
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`w-8 h-8 rounded-xl ${section.bg} flex items-center justify-center`}>
                <SectionIcon size={16} className={section.color} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
            </div>
            <div className="space-y-2">
              {section.rows.map((row, idx) => (
                <div key={idx} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{row.label}</span>
                  <span className="text-sm font-bold text-gray-900 text-right max-w-[60%] whitespace-pre-wrap">{row.value || '—'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {sections.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
          <p className="text-sm text-gray-400">No application data found.</p>
        </div>
      )}

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
