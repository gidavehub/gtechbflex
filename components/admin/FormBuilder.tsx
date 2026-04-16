'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, Eye, ArrowLeft, Layers, Sparkles, Loader2, Undo2 } from 'lucide-react';
import FormFieldEditor from './FormFieldEditor';
import DynamicFormRenderer from '@/components/form/DynamicFormRenderer';
import type { FormField, FormFieldType, Program } from '@/lib/types';
import { FIELD_TYPE_OPTIONS, DEFAULT_FORM_FIELDS } from '@/lib/types';
import { updateProgram } from '@/lib/firestore';
import { useToast } from '@/context/ToastContext';

interface FormBuilderProps {
  program: Program;
  onClose: () => void;
  onSaved: (fields: FormField[]) => void;
}

export default function FormBuilder({ program, onClose, onSaved }: FormBuilderProps) {
  const { toast } = useToast();
  const [fields, setFields] = useState<FormField[]>(program.fields || []);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

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
    try {
      await updateProgram(program.id, { fields });
      onSaved(fields);
      toast({ title: 'Form saved!', type: 'success' });
    } catch {
      toast({ title: 'Error saving form', type: 'error' });
    }
    setSaving(false);
  };

  const loadTemplate = () => {
    if (fields.length > 0 && !confirm('This will replace your current form fields. Continue?')) return;
    setFields([...DEFAULT_FORM_FIELDS]);
    toast({ title: 'Template loaded', type: 'success' });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-gray-50/95 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers size={14} className="text-gold-500" />
                Form Builder
              </h2>
              <p className="text-[11px] text-gray-400">{program.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
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
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-65px)] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
                <div className="text-center mb-6">
                  <span className="px-3 py-1 rounded-full bg-gold-50 text-gold-600 border border-gold-200 text-[10px] font-bold uppercase tracking-wider">Preview Mode</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-3">Apply to {program.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">This is how applicants will see your form</p>
                </div>
                <DynamicFormRenderer
                  fields={fields}
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
                    <Sparkles size={12} /> Load Template
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
                  <p className="text-sm text-gray-500 mb-6">Start building your application form by adding fields or loading a template.</p>
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={loadTemplate} className="btn-primary flex items-center gap-2 text-sm">
                      <Sparkles size={14} /> Load Template
                    </button>
                    <button onClick={() => setShowAddMenu(true)} className="btn-secondary flex items-center gap-2 text-sm">
                      <Plus size={14} /> Add Field
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {fields.map((field, idx) => (
                      <FormFieldEditor
                        key={field.id}
                        field={field}
                        onChange={updated => updateField(idx, updated)}
                        onDelete={() => deleteField(idx)}
                        onMoveUp={() => moveField(idx, 'up')}
                        onMoveDown={() => moveField(idx, 'down')}
                        isFirst={idx === 0}
                        isLast={idx === fields.length - 1}
                        allFields={fields}
                      />
                    ))}
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
    </div>
  );
}
