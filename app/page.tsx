'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  GraduationCap, Briefcase, Target, TrendingUp, Handshake,
  ArrowRight, ArrowLeft, CheckCircle, Loader2, Sparkles, Send,
} from 'lucide-react';
import DynamicFormRenderer from '@/components/form/DynamicFormRenderer';
import { useToast } from '@/context/ToastContext';
import { createApplication, checkExistingApplicationByEmail } from '@/lib/firestore';
import { getVisibleFormFields } from '@/lib/types';
import type { FormField, ProgramType } from '@/lib/types';

// ==========================================
// PROGRAM TYPE CONFIG
// ==========================================
const PROGRAM_TYPE_OPTIONS: {
  value: ProgramType;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  accent: string;
}[] = [
  {
    value: 'mentorship',
    label: 'Mentorship',
    description: 'Get paired with experienced mentors to guide your entrepreneurial journey',
    icon: GraduationCap,
    gradient: 'from-violet-500 to-purple-600',
    accent: 'border-violet-300 bg-violet-50 ring-violet-400/20',
  },
  {
    value: 'investment_readiness',
    label: 'Investment Readiness',
    description: 'Prepare your business to attract and secure investment funding',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'border-emerald-300 bg-emerald-50 ring-emerald-400/20',
  },
  {
    value: 'business_linkage',
    label: 'Business Linkage',
    description: 'Connect with partners, suppliers, and market opportunities',
    icon: Handshake,
    gradient: 'from-amber-500 to-orange-600',
    accent: 'border-amber-300 bg-amber-50 ring-amber-400/20',
  },
  {
    value: 'incubation',
    label: 'Incubation',
    description: 'Access workspace, resources, and structured support to grow your startup',
    icon: Target,
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'border-blue-300 bg-blue-50 ring-blue-400/20',
  },
  {
    value: 'acceleration',
    label: 'Acceleration',
    description: 'Fast-track your business growth with intensive coaching and resources',
    icon: Briefcase,
    gradient: 'from-rose-500 to-pink-600',
    accent: 'border-rose-300 bg-rose-50 ring-rose-400/20',
  },
];

// ==========================================
// VALIDATION
// ==========================================
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

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function HomePage() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<ProgramType | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = type select
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Dynamically compute visible fields based on program type and current answers
  const fields = useMemo(() => {
    if (!selectedType) return [];
    return getVisibleFormFields(selectedType, values);
  }, [selectedType, values]);

  // Split fields into steps by heading fields
  const steps = useMemo(() => {
    const result: { title: string; fields: FormField[] }[] = [];
    let currentGroup: FormField[] = [];
    let currentTitle = 'Details';

    fields.forEach(field => {
      if (field.type === 'heading') {
        if (currentGroup.length > 0) {
          result.push({ title: currentTitle, fields: currentGroup });
        }
        currentTitle = field.label;
        currentGroup = [];
      } else {
        currentGroup.push(field);
      }
    });
    if (currentGroup.length > 0) {
      result.push({ title: currentTitle, fields: currentGroup });
    }
    return result;
  }, [fields]);

  // Steps: 0=type select, 1..N=form sections, N+1=review
  const totalSteps = steps.length + 2; // +1 for type select, +1 for review
  const isTypeStep = currentStep === 0;
  const isReviewStep = currentStep === totalSteps - 1;
  const formStepIndex = currentStep - 1; // index into steps[]

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const validateCurrentFormStep = (): boolean => {
    if (formStepIndex < 0 || formStepIndex >= steps.length) return true;
    const stepFields = steps[formStepIndex].fields;
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
    if (isTypeStep) {
      if (!selectedType) {
        toast({ title: 'Please select a program type', type: 'error' });
        return;
      }
      setCurrentStep(1);
      return;
    }
    if (validateCurrentFormStep()) {
      setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    if (!validateAllFields()) {
      toast({ title: 'Please fix all errors before submitting', type: 'error' });
      return;
    }

    // Check for duplicate by email
    const emailField = fields.find(f => f.type === 'email');
    const email = emailField ? values[emailField.id] : null;
    if (email) {
      try {
        const exists = await checkExistingApplicationByEmail(selectedType, email);
        if (exists) {
          toast({ title: 'Already Applied', description: 'An application with this email already exists for this program type.', type: 'error' });
          return;
        }
      } catch {}
    }

    setSubmitting(true);
    try {
      await createApplication({
        program_type: selectedType,
        answers: values,
        status: 'under_review',
      });

      // Send confirmation email
      if (email) {
        const nameField = fields.find(f => f.id === 'full_name' || f.label.toLowerCase().includes('name'));
        const name = nameField ? values[nameField.id] : '';
        const typeLabel = PROGRAM_TYPE_OPTIONS.find(t => t.value === selectedType)?.label || selectedType;
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'application_submitted',
              to: email,
              name: name?.split(' ')[0] || 'Applicant',
              programName: `G-Tech ${typeLabel}`,
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

  const handleStartOver = () => {
    setSelectedType(null);
    setCurrentStep(0);
    setValues({});
    setErrors({});
    setSubmitted(false);
    setConfirmChecked(false);
  };

  const selectedTypeConfig = PROGRAM_TYPE_OPTIONS.find(t => t.value === selectedType);

  // ---- Success Screen ----
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <HeaderBar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="max-w-md w-full text-center"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 12 }}
              >
                <CheckCircle className="text-emerald-600" size={48} />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted! 🎉</h2>
            <p className="text-sm text-gray-500 mb-2">
              Your <strong className="text-gray-700">{selectedTypeConfig?.label}</strong> application has been received.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              We&apos;ll review your application and get back to you soon.
            </p>
            <button
              onClick={handleStartOver}
              className="btn-primary inline-flex items-center gap-2"
            >
              Submit Another Application
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---- Main Form ----
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <HeaderBar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-xs font-bold text-gold-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold-gradient rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center justify-between mt-3 px-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < currentStep
                    ? 'bg-gold-400 scale-100'
                    : i === currentStep
                      ? 'bg-gold-400 scale-125 ring-4 ring-gold-400/20'
                      : 'bg-gray-200 scale-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {/* ---- Step 0: Program Type Selection ---- */}
              {isTypeStep && (
                <motion.div
                  key="type-select"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={16} className="text-gold-400" />
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                        Getting Started
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      What are you applying for?
                    </h2>
                    <p className="text-sm text-gray-500">
                      Select the type of program that best fits your needs.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {PROGRAM_TYPE_OPTIONS.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setSelectedType(type.value)}
                          className={`w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200 group ${
                            isSelected
                              ? `${type.accent} ring-4 shadow-sm`
                              : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                              <Icon size={22} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className={`text-sm font-bold transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                  {type.label}
                                </h3>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 15 }}
                                  >
                                    <CheckCircle size={16} className="text-emerald-500" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ---- Form Steps ---- */}
              {!isTypeStep && !isReviewStep && formStepIndex >= 0 && formStepIndex < steps.length && (
                <motion.div
                  key={`step-${currentStep}`}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-5">
                    {selectedTypeConfig && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${selectedTypeConfig.gradient} flex items-center justify-center`}>
                          <selectedTypeConfig.icon size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {selectedTypeConfig.label} Application
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{steps[formStepIndex].title}</h3>
                  </div>
                  <DynamicFormRenderer
                    fields={steps[formStepIndex].fields}
                    values={values}
                    onChange={handleChange}
                    errors={errors}
                  />
                </motion.div>
              )}

              {/* ---- Review Step ---- */}
              {isReviewStep && (
                <motion.div
                  key="review"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-5">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                      Final Step
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">Review & Submit</h3>
                    <p className="text-sm text-gray-500">Please review your answers before submitting.</p>
                  </div>

                  {/* Program type summary */}
                  {selectedTypeConfig && (
                    <div className={`rounded-2xl border-2 p-4 mb-4 ${selectedTypeConfig.accent}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedTypeConfig.gradient} flex items-center justify-center`}>
                          <selectedTypeConfig.icon size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Program Type</p>
                          <p className="text-sm font-bold text-gray-900">{selectedTypeConfig.label}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                    <h4 className="text-sm font-bold text-gold-600">Application Summary</h4>
                    <div className="space-y-2 text-sm">
                      {fields.filter(f => !['heading', 'paragraph'].includes(f.type)).map(field => {
                        let displayValue = values[field.id];
                        if (Array.isArray(displayValue)) displayValue = displayValue.join(', ');
                        if (typeof displayValue === 'boolean') displayValue = displayValue ? 'Yes' : 'No';

                        return (
                          <div key={field.id} className="flex items-start justify-between py-1.5 border-b border-gray-100 last:border-0">
                            <span className="text-gray-400 text-xs font-medium">{field.label}</span>
                            <span className="text-gray-900 font-semibold text-right max-w-[60%] text-xs">{displayValue || '—'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 text-sm cursor-pointer mt-5 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-colors">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                      confirmChecked ? 'border-gold-500 bg-gold-500' : 'border-gray-300'
                    }`}>
                      {confirmChecked && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={confirmChecked}
                      onChange={e => setConfirmChecked(e.target.checked)}
                      className="sr-only"
                    />
                    <span className="text-gray-600 text-xs leading-relaxed">
                      I confirm that all information provided is accurate and complete. I understand that my application will be reviewed by the G-Tech team.
                    </span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 mt-5 border-t border-gray-100">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 py-4 text-sm"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {!isReviewStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-sm"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !confirmChecked}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Submit Application <Send size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-gray-400 mt-6 px-4">
          Your information is securely stored and will only be used for application processing.
        </p>
      </main>

      {/* Minimal footer */}
      <footer className="text-center py-6 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Image src="/logo.webp" alt="G-Tech" width={20} height={20} className="rounded" />
          <span className="text-xs font-bold text-gray-900">
            B-<span className="text-gold-gradient">Flex</span>
          </span>
          <span className="text-xs text-gray-400">by G-Tech Gambia</span>
        </div>
        <p className="text-[11px] text-gray-400">
          © {new Date().getFullYear()} All rights reserved •{' '}
          <a href="mailto:gtech@connekt.gm" className="hover:text-gold-500 transition-colors">
            gtech@connekt.gm
          </a>
        </p>
      </footer>
    </div>
  );
}

// ==========================================
// HEADER BAR (compact, mobile-first)
// ==========================================
function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.webp" alt="G-Tech" width={28} height={28} className="rounded-lg" />
          <span className="text-base font-bold text-gray-900">
            B-<span className="text-gold-gradient">Flex</span>
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-500">
          Application Form
        </span>
      </div>
    </header>
  );
}
