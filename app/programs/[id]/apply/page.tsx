'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DynamicFormRenderer from '@/components/form/DynamicFormRenderer';
import { useToast } from '@/context/ToastContext';
import { getProgram, createApplication, checkExistingApplicationByEmail } from '@/lib/firestore';
import type { Program, FormField } from '@/lib/types';

function validateField(field: FormField, value: any): string | undefined {
  if (field.type === 'heading' || field.type === 'paragraph') return undefined;

  if (field.required) {
    if (value === undefined || value === null || value === '') return `${field.label} is required`;
    if (Array.isArray(value) && value.length === 0) return `Please select at least one option`;
    if (field.type === 'checkbox' && !value) return `You must check this field`;
  }

  if (!value) return undefined;

  const v = field.validation;
  if (v) {
    if (v.minLength && String(value).length < v.minLength) return `Must be at least ${v.minLength} characters`;
    if (v.maxLength && String(value).length > v.maxLength) return `Must be at most ${v.maxLength} characters`;
    if (v.min !== undefined && Number(value) < v.min) return `Must be at least ${v.min}`;
    if (v.max !== undefined && Number(value) > v.max) return `Must be at most ${v.max}`;
    if (v.pattern) {
      try {
        if (!new RegExp(v.pattern).test(String(value))) return v.patternMessage || 'Invalid format';
      } catch {}
    }
  }

  if (field.type === 'email' && value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(value))) return 'Please enter a valid email address';
  }

  return undefined;
}

export default function PublicApplyPage() {
  const params = useParams();
  const programId = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Multi-step: split by heading fields
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!programId) return;
      try {
        const p = await getProgram(programId);
        setProgram(p);
      } catch {}
      setLoading(false);
    };
    load();
  }, [programId]);

  const fields = program?.fields || [];

  // Split fields into steps by heading fields
  const steps: { title: string; fields: FormField[] }[] = [];
  let currentGroup: FormField[] = [];
  let currentTitle = 'Application';

  fields.forEach(field => {
    if (field.type === 'heading') {
      if (currentGroup.length > 0) {
        steps.push({ title: currentTitle, fields: currentGroup });
      }
      currentTitle = field.label;
      currentGroup = [];
    } else {
      currentGroup.push(field);
    }
  });
  if (currentGroup.length > 0) {
    steps.push({ title: currentTitle, fields: currentGroup });
  }

  // If no headings, put everything in one step
  if (steps.length === 0 && fields.length > 0) {
    steps.push({ title: 'Application', fields: fields.filter(f => f.type !== 'heading') });
  }

  // Add review step
  const totalSteps = steps.length + 1; // +1 for review

  const handleChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    // Clear error on change
    if (errors[fieldId]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep >= steps.length) return true; // Review step
    const stepFields = steps[currentStep].fields;
    const newErrors: Record<string, string> = {};
    stepFields.forEach(field => {
      const error = validateField(field, values[field.id]);
      if (error) newErrors[field.id] = error;
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length > 0) {
      toast({ title: 'Please fix the errors before continuing', type: 'error' });
      return false;
    }
    return true;
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field, values[field.id]);
      if (error) newErrors[field.id] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      toast({ title: 'Please fix all errors before submitting', type: 'error' });
      return;
    }

    // Check for duplicate by email
    const emailField = fields.find(f => f.type === 'email');
    const email = emailField ? values[emailField.id] : null;
    if (email) {
      try {
        const exists = await checkExistingApplicationByEmail(programId, email);
        if (exists) {
          toast({ title: 'Already Applied', description: 'An application with this email already exists for this program.', type: 'error' });
          return;
        }
      } catch {}
    }

    setSubmitting(true);
    try {
      await createApplication({
        program_id: programId,
        answers: values,
        status: 'under_review',
      });

      // Send confirmation email
      if (email) {
        const nameField = fields.find(f => f.id === 'full_name' || f.label.toLowerCase().includes('name'));
        const name = nameField ? values[nameField.id] : '';
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'application_submitted',
              to: email,
              name: name?.split(' ')[0] || 'Applicant',
              programName: program?.title || 'G-Tech Program',
            }),
          });
        } catch {}
      }

      setSubmitted(true);
      toast({ title: 'Application submitted successfully!', type: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit', type: 'error' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin text-gold-400" size={32} />
        </div>
      </div>
    );
  }

  if (!program || !program.is_applications_open) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="pt-24 text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-5">
            <CheckCircle size={32} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Applications Not Available</h2>
          <p className="text-sm text-gray-500 mb-6">This program is not currently accepting applications.</p>
          <Link href={`/programs/${programId}`} className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Program
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center pt-32 px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted! 🎉</h2>
          <p className="text-sm text-gray-500 mb-2">Your application for <strong className="text-gray-700">{program.title}</strong> has been received.</p>
          <p className="text-xs text-gray-400 mb-8">We&apos;ll review your application and get back to you soon.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              Browse More Programs
            </Link>
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isReviewStep = currentStep >= steps.length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="pt-20 pb-12 max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href={`/programs/${programId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to Program
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Apply to {program.title}</h1>
          <p className="text-sm text-gray-500">Fill out the form below to submit your application.</p>
        </motion.div>

        {/* Progress */}
        {steps.length > 1 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { if (i < currentStep || validateCurrentStep()) setCurrentStep(i); }}
                  className={`flex flex-col items-center gap-1 transition-all ${i <= currentStep ? 'text-gold-500' : 'text-gray-300'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentStep ? 'bg-gold-400 text-white' : i === currentStep ? 'bg-gold-400 text-white ring-4 ring-gold-400/20' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i < currentStep ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className="text-[10px] font-semibold hidden sm:block">{step.title}</span>
                </button>
              ))}
              {/* Review step indicator */}
              <button
                type="button"
                onClick={() => { if (validateCurrentStep()) setCurrentStep(steps.length); }}
                className={`flex flex-col items-center gap-1 transition-all ${isReviewStep ? 'text-gold-500' : 'text-gray-300'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isReviewStep ? 'bg-gold-400 text-white ring-4 ring-gold-400/20' : 'bg-gray-100 text-gray-400'
                }`}>
                  {steps.length + 1}
                </div>
                <span className="text-[10px] font-semibold hidden sm:block">Review</span>
              </button>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gold-gradient rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {!isReviewStep ? (
                <motion.div
                  key={`step-${currentStep}`}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {steps.length > 1 && (
                    <div className="mb-5">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Step {currentStep + 1} of {totalSteps}</span>
                      <h3 className="text-lg font-bold text-gray-900">{steps[currentStep].title}</h3>
                    </div>
                  )}
                  <DynamicFormRenderer
                    fields={steps[currentStep].fields}
                    values={values}
                    onChange={handleChange}
                    errors={errors}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="review"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-5">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Step {totalSteps} of {totalSteps}</span>
                    <h3 className="text-lg font-bold text-gray-900">Review & Submit</h3>
                    <p className="text-sm text-gray-500">Please review your answers before submitting.</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                    <h4 className="text-sm font-bold text-gold-600">Application Summary</h4>
                    <div className="space-y-2 text-sm">
                      {fields.filter(f => !['heading', 'paragraph'].includes(f.type)).map(field => {
                        let displayValue = values[field.id];
                        if (Array.isArray(displayValue)) displayValue = displayValue.join(', ');
                        if (typeof displayValue === 'boolean') displayValue = displayValue ? 'Yes' : 'No';

                        return (
                          <div key={field.id} className="flex items-start justify-between py-1">
                            <span className="text-gray-400 text-xs font-medium">{field.label}</span>
                            <span className="text-gray-900 font-semibold text-right max-w-[60%] text-xs">{displayValue || '—'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <label className="flex items-start gap-3 text-sm cursor-pointer mt-4">
                    <input type="checkbox" required className="rounded border-gray-300 accent-gold-400 mt-1" />
                    <span className="text-gray-600">I confirm that all information provided is accurate and complete.</span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
              {currentStep > 0 && (
                <button type="button" onClick={handleBack} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3.5">
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {!isReviewStep ? (
                <button type="button" onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
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
      </main>

      <Footer />
    </div>
  );
}
