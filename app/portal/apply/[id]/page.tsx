'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CustomInput from '@/components/ui/CustomInput';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CustomTextarea from '@/components/ui/CustomTextarea';
import CustomCalendar from '@/components/ui/CustomCalendar';
import CustomMultiSelect from '@/components/ui/CustomMultiSelect';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getProgram, createApplication, checkExistingApplication } from '@/lib/firestore';
import { GENDERS, COUNTRIES, GAMBIA_REGIONS, BUSINESS_SECTORS, FORMALIZATION_STATUSES, PROGRAM_INTERESTS } from '@/lib/types';
import type { Program } from '@/lib/types';

const STEPS = [
  { title: 'Personal Info', desc: 'Your basic details' },
  { title: 'Business Details', desc: 'About your business' },
  { title: 'Program Preferences', desc: 'What support you need' },
  { title: 'Review & Submit', desc: 'Confirm your application' },
];

export default function ApplyPage() {
  const params = useParams();
  const programId = params?.id as string;
  const router = useRouter();
  const { portalUser } = useAuth();
  const { toast } = useToast();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form state
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', gender: '', country: '', region: '',
    business_name: '', business_sector: '', formalization_status: '', year_established: null as number | null,
    description_of_need: '', program_interests: [] as string[],
  });

  useEffect(() => {
    const load = async () => {
      if (!programId) return;
      try {
        // Check duplicate
        if (portalUser) {
          const exists = await checkExistingApplication(programId, portalUser.uid);
          if (exists) {
            toast({ title: 'Already Applied', description: 'You have an active application for this program.', type: 'error' });
            router.push('/portal/applications');
            return;
          }
        }
        const p = await getProgram(programId);
        setProgram(p);
      } catch {}
      setLoading(false);
    };
    load();
  }, [programId, portalUser, router, toast]);

  // Pre-fill from user profile
  useEffect(() => {
    if (portalUser) {
      setForm(prev => ({
        ...prev,
        full_name: `${portalUser.first_name} ${portalUser.last_name}`,
        email: portalUser.email,
        phone: portalUser.phone || '',
        gender: portalUser.gender || '',
        country: portalUser.country || '',
        region: portalUser.region || '',
      }));
    }
  }, [portalUser]);

  const setField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.full_name || !form.email || !form.gender || !form.country) {
        toast({ title: 'Please fill in all required fields', type: 'error' });
        return false;
      }
    }
    if (step === 1) {
      if (!form.business_name || !form.business_sector || !form.formalization_status || !form.year_established) {
        toast({ title: 'Please fill in all required fields', type: 'error' });
        return false;
      }
    }
    if (step === 2) {
      if (!form.description_of_need || form.program_interests.length === 0) {
        toast({ title: 'Please describe your needs and select at least one program interest', type: 'error' });
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) { setDirection(1); setStep(s => Math.min(s + 1, STEPS.length - 1)); } };
  const prev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await createApplication({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        gender: form.gender as any,
        country: form.country,
        region: form.region,
        business_name: form.business_name,
        business_sector: form.business_sector,
        formalization_status: form.formalization_status as any,
        year_established: form.year_established!,
        description_of_need: form.description_of_need,
        program_interests: form.program_interests,
        program_id: programId,
        portal_user_id: portalUser?.uid || '',
        status: 'under_review',
        metadata: {},
      });

      // Send confirmation email
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'application_submitted',
            to: form.email,
            name: form.full_name.split(' ')[0],
            programName: program?.title || 'G-Tech Program',
          }),
        });
      } catch {}

      setSubmitted(true);
      toast({ title: 'Application submitted!', type: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit', type: 'error' });
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  if (!program || !program.is_applications_open) {
    return (
      <div className="text-center py-24 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Applications Not Available</h2>
        <p className="text-sm text-gray-500 mb-4">This program is not currently accepting applications.</p>
        <Link href="/portal/programs" className="btn-secondary inline-flex items-center gap-2"><ArrowLeft size={16} /> Back to Programs</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-emerald-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted! 🎉</h2>
        <p className="text-sm text-gray-500 mb-2">Your application for <strong className="text-gray-700">{program.title}</strong> has been received.</p>
        <p className="text-xs text-gray-400 mb-8">We&apos;ve sent a confirmation email to {form.email}.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/portal/applications" className="btn-secondary">My Applications</Link>
          <Link href="/portal" className="btn-primary">Dashboard</Link>
        </div>
      </motion.div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Apply to {program.title}</h1>
        <p className="text-sm text-gray-500">Fill out the form below. Your details have been pre-filled where possible.</p>
      </motion.div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { if (i < step || validateStep()) { setDirection(i > step ? 1 : -1); setStep(i); } }}
              className={`flex flex-col items-center gap-1 transition-all ${i <= step ? 'text-gold-500' : 'text-gray-300'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-gold-400 text-white' : i === step ? 'bg-gold-400 text-white ring-4 ring-gold-400/20' : 'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className="text-[10px] font-semibold hidden sm:block">{s.title}</span>
            </button>
          ))}
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gold-gradient rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -60 : 60, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Step {step + 1} of {STEPS.length}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{STEPS[step].title}</h3>
                <p className="text-sm text-gray-500">{STEPS[step].desc}</p>
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  <CustomInput label="Full Name" value={form.full_name} onChange={v => setField('full_name', v)} required placeholder="Enter your full name" />
                  <CustomInput label="Email" type="email" value={form.email} onChange={v => setField('email', v)} required readOnly />
                  <CustomInput label="Phone Number" value={form.phone} onChange={v => setField('phone', v)} placeholder="Optional" />
                  <CustomDropdown label="Gender" options={GENDERS} value={form.gender} onChange={v => setField('gender', v)} required />
                  <CustomDropdown label="Country of Residence" options={COUNTRIES} value={form.country} onChange={v => setField('country', v)} required searchable />
                  <CustomDropdown label="Region" options={GAMBIA_REGIONS} value={form.region} onChange={v => setField('region', v)} />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <CustomInput label="Business Name" value={form.business_name} onChange={v => setField('business_name', v)} required placeholder="Enter your business name" />
                  <CustomDropdown label="Business Sector" options={BUSINESS_SECTORS} value={form.business_sector} onChange={v => setField('business_sector', v)} required searchable />
                  <CustomDropdown label="Formalization Status" options={FORMALIZATION_STATUSES} value={form.formalization_status} onChange={v => setField('formalization_status', v)} required />
                  <CustomCalendar label="Year of Establishment" value={form.year_established} onChange={v => setField('year_established', v)} required />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <CustomTextarea label="Description of Need" value={form.description_of_need} onChange={v => setField('description_of_need', v)} required placeholder="Describe what support you need and how this program can help your business..." maxLength={1000} rows={5} />
                  <CustomMultiSelect label="Program Interests" options={PROGRAM_INTERESTS} value={form.program_interests} onChange={v => setField('program_interests', v)} required />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                    <h4 className="text-sm font-bold text-gold-600">Application Summary</h4>
                    <div className="space-y-2 text-sm">
                      <SummaryRow label="Name" value={form.full_name} />
                      <SummaryRow label="Email" value={form.email} />
                      {form.phone && <SummaryRow label="Phone" value={form.phone} />}
                      <SummaryRow label="Gender" value={form.gender} />
                      <SummaryRow label="Country" value={form.country} />
                      {form.region && <SummaryRow label="Region" value={form.region} />}
                      <div className="border-t border-gray-200 my-2" />
                      <SummaryRow label="Business" value={form.business_name} />
                      <SummaryRow label="Sector" value={form.business_sector} />
                      <SummaryRow label="Status" value={form.formalization_status} />
                      <SummaryRow label="Est. Year" value={String(form.year_established || '')} />
                      <div className="border-t border-gray-200 my-2" />
                      <SummaryRow label="Interests" value={form.program_interests.join(', ')} />
                    </div>
                  </div>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input type="checkbox" required className="rounded border-gray-300 accent-gold-400 mt-1" />
                    <span className="text-gray-600">I confirm that all information provided is accurate and complete.</span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
            {step > 0 && (
              <button type="button" onClick={prev} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3.5">
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Submit Application <CheckCircle size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-gray-400 text-xs font-medium">{label}</span>
      <span className="text-gray-900 font-semibold text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );
}
