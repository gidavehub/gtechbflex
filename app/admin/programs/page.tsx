'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Save, Eye, Layers, Sparkles, Loader2, Undo2,
  Info, ArrowRight,
} from 'lucide-react';
import FormFieldEditor from '@/components/admin/FormFieldEditor';
import DynamicFormRenderer from '@/components/form/DynamicFormRenderer';
import type { FormField, FormFieldType, ProgramType } from '@/lib/types';
import {
  FIELD_TYPE_OPTIONS, DEFAULT_FORM_FIELDS,
  BUSINESS_PROGRAM_TYPES, BUSINESS_GATE_PROGRAM_TYPES,
  getVisibleFormFields,
} from '@/lib/types';
import { useToast } from '@/context/ToastContext';

const TYPE_LABELS: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

const TYPE_COLORS: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
  mentorship: { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  investment_readiness: { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  business_linkage: { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  incubation: { gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  acceleration: { gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

// IDs of fields that belong to the conditional business sections (for highlighting)
const BUSINESS_GATE_FIELD_IDS = ['section_business_gate', 'has_business'];
const BUSINESS_INFO_FIELD_IDS = ['section_business', 'business_name', 'business_sector', 'formalization'];
const BUSINESS_QUESTION_FIELD_IDS = ['section_business_questions', 'revenue_model', 'annual_revenue', 'has_raised_funds', 'wants_to_raise_funds'];

export default function AdminFormPage() {
  const { toast } = useToast();
  const [fields, setFields] = useState<FormField[]>([...DEFAULT_FORM_FIELDS]);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [previewType, setPreviewType] = useState<ProgramType>('business_linkage');
  const [saving, setSaving] = useState(false);

  // For the preview, compute visible fields
  const previewFields = useMemo(() => {
    return getVisibleFormFields(previewType, {});
  }, [previewType]);

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      label: type === 'heading' ? 'New Section' : type === 'paragraph' ? '' : 'New Field',
      required: false,
      width: 'full',
      options: ['select', 'multiselect', 'radio'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
      content: type === 'paragraph' ? 'Enter instructions here...' : undefined,
    };
    setFields([...fields, newField]);
    setShowAddMenu(false);
  };

  const updateField = (index: number, updated: FormField) => {
    const copy = [...fields];
    copy[index] = updated;
    setFields(copy);
  };

  const deleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const copy = [...fields];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= copy.length) return;
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setFields(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    // In production, persist to Firestore under a global config doc
    // For now, the form is defined in types.ts as DEFAULT_FORM_FIELDS
    await new Promise(r => setTimeout(r, 600));
    toast({ title: 'Form configuration saved!', type: 'success' });
    setSaving(false);
  };

  const loadTemplate = () => {
    if (fields.length > 0 && !confirm('This will reset to the default form template. Continue?')) return;
    setFields([...DEFAULT_FORM_FIELDS]);
    toast({ title: 'Default template loaded', type: 'success' });
  };

  // Helper to determine what section a field belongs to (for visual grouping)
  const getFieldSection = (fieldId: string): string | null => {
    if (BUSINESS_GATE_FIELD_IDS.includes(fieldId)) return 'gate';
    if (BUSINESS_INFO_FIELD_IDS.includes(fieldId)) return 'business';
    if (BUSINESS_QUESTION_FIELD_IDS.includes(fieldId)) return 'questions';
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Application Form</h1>
          <p className="text-sm text-gray-500">Edit form fields and preview how they appear per program type</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              showPreview ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Eye size={14} /> {showPreview ? 'Editor' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-xs px-5 py-2.5 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Form
          </button>
        </div>
      </div>

      {/* Conditional Logic Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/60 rounded-2xl px-5 py-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-400 rounded-full" />
        <div className="pl-3">
          <p className="text-xs text-purple-800 font-bold mb-1.5 flex items-center gap-1.5">
            <ArrowRight size={12} /> Conditional / Dependent Fields
          </p>
          <div className="text-xs text-purple-700 leading-relaxed space-y-1">
            <p>
              <span className="inline-block px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200 text-[10px] font-bold mr-1">MENTORSHIP</span>
              Shows &quot;Do you own a business?&quot; gate — if Yes, business section appears
            </p>
            <p>
              <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold mr-1">BUSINESS LINKAGE</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold mr-1">INCUBATION</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold mr-1">ACCELERATION</span>
              Always show business info + revenue model, annual revenue, fundraising questions
            </p>
            <p>
              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold mr-1">INVESTMENT READINESS</span>
              Personal info + motivation only (no business section)
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="max-w-2xl mx-auto"
          >
            {/* Program type selector tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(TYPE_LABELS).map(([value, label]) => {
                const colors = TYPE_COLORS[value] || TYPE_COLORS.mentorship;
                const isActive = previewType === value;
                return (
                  <button
                    key={value}
                    onClick={() => setPreviewType(value as ProgramType)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm ring-2 ring-offset-1`
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={isActive ? { '--tw-ring-color': 'rgba(139,92,246,0.15)' } as any : {}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="text-center mb-6">
                <span className="px-3 py-1 rounded-full bg-gold-50 text-gold-600 border border-gold-200 text-[10px] font-bold uppercase tracking-wider">
                  Preview — {TYPE_LABELS[previewType]}
                </span>
                <p className="text-xs text-gray-400 mt-2">
                  This is how applicants see the form for <strong>{TYPE_LABELS[previewType]}</strong>
                </p>
              </div>
              <DynamicFormRenderer
                fields={previewFields}
                values={{}}
                onChange={() => {}}
                readOnly
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="max-w-2xl mx-auto"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {fields.length} field{fields.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadTemplate}
                  className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={12} /> Reset to Default
                </button>
                {fields.length > 0 && (
                  <button
                    onClick={() => { if (confirm('Clear all fields?')) setFields([]); }}
                    className="px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5"
                  >
                    <Undo2 size={12} /> Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Field list */}
            {fields.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-4">
                  <Layers size={28} className="text-gold-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Form Fields Yet</h3>
                <p className="text-sm text-gray-500 mb-6">Start building your application form by adding fields or loading the default template.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={loadTemplate} className="btn-primary flex items-center gap-2 text-sm">
                    <Sparkles size={14} /> Load Default
                  </button>
                  <button onClick={() => setShowAddMenu(true)} className="btn-secondary flex items-center gap-2 text-sm">
                    <Plus size={14} /> Add Field
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {fields.map((field, idx) => {
                    const section = getFieldSection(field.id);
                    return (
                      <div key={field.id}>
                        {/* Section banner for conditional groups */}
                        {idx === fields.findIndex(f => getFieldSection(f.id) === 'gate') && section === 'gate' && (
                          <div className="flex items-center gap-2 py-2 mb-1">
                            <div className="h-px flex-1 bg-violet-200" />
                            <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-[10px] font-bold uppercase tracking-wider">
                              🔀 Mentorship Only — Business Gate
                            </span>
                            <div className="h-px flex-1 bg-violet-200" />
                          </div>
                        )}
                        {idx === fields.findIndex(f => getFieldSection(f.id) === 'business') && section === 'business' && (
                          <div className="flex items-center gap-2 py-2 mb-1">
                            <div className="h-px flex-1 bg-amber-200" />
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                              📋 Conditional — Business Information
                            </span>
                            <div className="h-px flex-1 bg-amber-200" />
                          </div>
                        )}
                        {idx === fields.findIndex(f => getFieldSection(f.id) === 'questions') && section === 'questions' && (
                          <div className="flex items-center gap-2 py-2 mb-1">
                            <div className="h-px flex-1 bg-emerald-200" />
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                              💰 Business Linkage / Incubation / Acceleration Only
                            </span>
                            <div className="h-px flex-1 bg-emerald-200" />
                          </div>
                        )}
                        <FormFieldEditor
                          field={field}
                          onChange={updated => updateField(idx, updated)}
                          onDelete={() => deleteField(idx)}
                          onMoveUp={() => moveField(idx, 'up')}
                          onMoveDown={() => moveField(idx, 'down')}
                          isFirst={idx === 0}
                          isLast={idx === fields.length - 1}
                          allFields={fields}
                        />
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Add field button */}
            <div className="mt-4 relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gold-300 text-sm font-bold text-gray-400 hover:text-gold-600 flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={16} /> Add Field
              </button>

              <AnimatePresence>
                {showAddMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-2xl border border-gray-200 shadow-xl p-3 z-50"
                  >
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {FIELD_TYPE_OPTIONS.map(t => (
                        <button
                          key={t.value}
                          onClick={() => addField(t.value)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gold-50 hover:text-gold-700 transition-all"
                        >
                          <span className="text-sm">{t.icon}</span>
                          <span className="truncate">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
