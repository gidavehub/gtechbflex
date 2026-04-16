'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Trash2, Settings,
  Eye, Plus, X, AlertTriangle,
  Type, AlignLeft, Mail, Phone, Hash, Calendar,
  CircleDot, CheckSquare, List, ListChecks
} from 'lucide-react';
import type { FormField, FormFieldType } from '@/lib/types';
import { FIELD_TYPE_OPTIONS } from '@/lib/types';

// ============================================
// Per-type color scheme for admin field cards
// ============================================
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode; badge: string }> = {
  text:        { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Type size={14} /> },
  textarea:    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <AlignLeft size={14} /> },
  email:       { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700 border-rose-200', icon: <Mail size={14} /> },
  phone:       { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Phone size={14} /> },
  number:      { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Hash size={14} /> },
  select:      { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700 border-purple-200', icon: <ChevronDown size={14} /> },
  multiselect: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700 border-teal-200', icon: <ListChecks size={14} /> },
  radio:       { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: <CircleDot size={14} /> },
  checkbox:    { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700 border-sky-200', icon: <CheckSquare size={14} /> },
  date:        { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700 border-pink-200', icon: <Calendar size={14} /> },
  heading:     { bg: 'bg-gray-800', border: 'border-gray-700', text: 'text-white', badge: 'bg-gray-700 text-gray-200 border-gray-600', icon: <span className="text-xs font-black">H</span> },
  paragraph:   { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: <AlignLeft size={14} /> },
};

const DEFAULT_COLORS = TYPE_COLORS.text;

interface FormFieldEditorProps {
  field: FormField;
  onChange: (updated: FormField) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  allFields: FormField[];
}

export default function FormFieldEditor({
  field, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, allFields,
}: FormFieldEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [newOption, setNewOption] = useState('');

  const update = (partial: Partial<FormField>) => onChange({ ...field, ...partial });
  const typeInfo = FIELD_TYPE_OPTIONS.find(t => t.value === field.type);
  const colors = TYPE_COLORS[field.type] || DEFAULT_COLORS;
  const hasOptions = ['select', 'multiselect', 'radio'].includes(field.type);
  const hasValidation = ['text', 'textarea', 'number', 'email', 'phone'].includes(field.type);
  const isDecorative = ['heading', 'paragraph'].includes(field.type);

  const addOption = () => {
    if (!newOption.trim()) return;
    const opts = [...(field.options || []), newOption.trim()];
    update({ options: opts });
    setNewOption('');
  };

  const removeOption = (idx: number) => {
    const opts = (field.options || []).filter((_, i) => i !== idx);
    update({ options: opts });
  };

  // Eligible fields for conditional logic (only fields before this one)
  const conditionalFields = allFields
    .filter(f => f.id !== field.id && !['heading', 'paragraph'].includes(f.type))
    .filter(f => {
      const thisIdx = allFields.findIndex(x => x.id === field.id);
      const thatIdx = allFields.findIndex(x => x.id === f.id);
      return thatIdx < thisIdx;
    });

  // Count issues for warning badge
  const issues: string[] = [];
  if (!field.label || field.label === 'New Field') issues.push('No label set');
  if (hasOptions && (!field.options || field.options.length === 0)) issues.push('No options defined');
  if (hasOptions && field.options && field.options.some(o => !o.trim())) issues.push('Empty option detected');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`rounded-2xl border-2 shadow-sm transition-all overflow-hidden ${
        expanded ? `${colors.border} shadow-md` : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Color accent bar at top */}
      <div className={`h-1 ${colors.bg} ${field.type === 'heading' ? 'bg-gray-800' : ''}`} />

      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white">
        {/* Reorder controls */}
        <div className="flex flex-col gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={isFirst} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
            <ChevronUp size={14} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Type icon */}
        <div className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center ${colors.text} shrink-0`}>
          {colors.icon}
        </div>

        {/* Label + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-gray-900 truncate">{field.label || 'Untitled Field'}</span>
            {/* Type badge */}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${colors.badge}`}>
              {typeInfo?.label}
            </span>
            {/* Required badge */}
            {field.required && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-100 text-red-600 border border-red-200">
                Required
              </span>
            )}
            {/* Width badge */}
            {field.width === 'half' && !isDecorative && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-gray-100 text-gray-500 border border-gray-200">
                Half
              </span>
            )}
            {/* Conditional badge */}
            {field.showIf && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-100 text-purple-600 border border-purple-200">
                Conditional
              </span>
            )}
            {/* Validation badge */}
            {field.validation && (field.validation.maxLength || field.validation.minLength || field.validation.min !== undefined || field.validation.max !== undefined) && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-600 border border-amber-200">
                Validated
              </span>
            )}
            {/* Warning badge */}
            {issues.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-0.5">
                <AlertTriangle size={9} /> {issues.length}
              </span>
            )}
          </div>
          {/* Options count */}
          {hasOptions && (
            <span className="text-[10px] text-gray-400 font-medium">
              {(field.options || []).length} option{(field.options || []).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              expanded ? `${colors.bg} ${colors.text}` : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <Settings size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 pt-3 border-t ${colors.border} bg-gray-50/30 space-y-4`}>
              {/* Warnings */}
              {issues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                  <div className="text-[11px] text-yellow-700 font-medium space-y-0.5">
                    {issues.map((issue, i) => <div key={i}>• {issue}</div>)}
                  </div>
                </div>
              )}

              {/* Type selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Field Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {FIELD_TYPE_OPTIONS.map(t => {
                    const tc = TYPE_COLORS[t.value] || DEFAULT_COLORS;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => update({ type: t.value })}
                        className={`px-2 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                          field.type === t.value
                            ? `${tc.bg} ${tc.text} ${tc.border} shadow-sm`
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={e => update({ label: e.target.value })}
                  placeholder="Field label"
                  className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm font-semibold outline-none transition-all ${
                    !field.label ? 'border-yellow-300 bg-yellow-50/50' : `border-gray-200 focus:${colors.border}`
                  }`}
                />
              </div>

              {/* Content (for heading/paragraph) */}
              {field.type === 'paragraph' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Content / Instructions</label>
                  <textarea
                    value={field.content || ''}
                    onChange={e => update({ content: e.target.value })}
                    placeholder="Instructions for the applicant..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none transition-all resize-none"
                  />
                </div>
              )}

              {/* Placeholder & Help Text (for input fields) */}
              {!isDecorative && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={e => update({ placeholder: e.target.value })}
                      placeholder="Placeholder text..."
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium focus:border-gold-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Help Text</label>
                    <input
                      type="text"
                      value={field.helpText || ''}
                      onChange={e => update({ helpText: e.target.value })}
                      placeholder="Extra info for applicant..."
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium focus:border-gold-400 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Options editor (for select, multiselect, radio) */}
              {hasOptions && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Options
                    {(!field.options || field.options.length === 0) && (
                      <span className="text-red-500 ml-1 normal-case">— At least 1 option required</span>
                    )}
                  </label>
                  <div className="space-y-1.5 mb-2">
                    {(field.options || []).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 group">
                        <div className={`w-5 h-5 rounded-md ${colors.bg} ${colors.border} border flex items-center justify-center text-[10px] font-bold ${colors.text}`}>
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onChange={e => {
                            const opts = [...(field.options || [])];
                            opts[idx] = e.target.value;
                            update({ options: opts });
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium focus:border-gold-400 outline-none transition-all ${
                            !opt.trim() ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={e => setNewOption(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      placeholder="Add option..."
                      className="flex-1 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm font-medium focus:border-gold-400 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className={`px-3 py-2 rounded-lg ${colors.bg} ${colors.text} text-xs font-bold hover:opacity-80 transition-all`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Required + Width */}
              {!isDecorative && (
                <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={e => update({ required: e.target.checked })}
                      className="rounded border-gray-300 accent-red-500"
                    />
                    <span className="text-xs font-bold text-gray-700">Required</span>
                    {field.required && <span className="text-[9px] font-black text-red-500">★</span>}
                  </label>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Width:</span>
                    <button
                      type="button"
                      onClick={() => update({ width: 'full' })}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                        (field.width || 'full') === 'full' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      Full
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ width: 'half' })}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                        field.width === 'half' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      Half
                    </button>
                  </div>
                </div>
              )}

              {/* Validation rules */}
              {hasValidation && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    Validation Rules
                    <span className="px-1 py-0.5 rounded text-[8px] bg-amber-100 text-amber-600 border border-amber-200 normal-case font-bold">Advanced</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 bg-white rounded-xl border border-gray-200 p-3">
                    {['text', 'textarea', 'email', 'phone'].includes(field.type) && (
                      <>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold mb-1">Min Characters</label>
                          <input
                            type="number"
                            value={field.validation?.minLength ?? ''}
                            onChange={e => update({ validation: { ...field.validation, minLength: e.target.value ? parseInt(e.target.value) : undefined } })}
                            placeholder="—"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-gold-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold mb-1">Max Characters</label>
                          <input
                            type="number"
                            value={field.validation?.maxLength ?? ''}
                            onChange={e => update({ validation: { ...field.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined } })}
                            placeholder="—"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-gold-400 outline-none"
                          />
                        </div>
                      </>
                    )}
                    {field.type === 'number' && (
                      <>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold mb-1">Min Value</label>
                          <input
                            type="number"
                            value={field.validation?.min ?? ''}
                            onChange={e => update({ validation: { ...field.validation, min: e.target.value ? parseInt(e.target.value) : undefined } })}
                            placeholder="—"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-gold-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold mb-1">Max Value</label>
                          <input
                            type="number"
                            value={field.validation?.max ?? ''}
                            onChange={e => update({ validation: { ...field.validation, max: e.target.value ? parseInt(e.target.value) : undefined } })}
                            placeholder="—"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-gold-400 outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Conditional logic */}
              {!isDecorative && conditionalFields.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    Conditional Visibility
                    <span className="px-1 py-0.5 rounded text-[8px] bg-purple-100 text-purple-600 border border-purple-200 normal-case font-bold">Logic</span>
                  </label>
                  {field.showIf ? (
                    <div className="bg-purple-50/50 rounded-xl p-3 border-2 border-purple-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-purple-700 font-bold">
                        <Eye size={12} /> Show this field only when:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={field.showIf.fieldId}
                          onChange={e => update({ showIf: { ...field.showIf!, fieldId: e.target.value } })}
                          className="px-2 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold bg-white outline-none"
                        >
                          <option value="">Select field</option>
                          {conditionalFields.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                        <select
                          value={field.showIf.operator}
                          onChange={e => update({ showIf: { ...field.showIf!, operator: e.target.value as any } })}
                          className="px-2 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold bg-white outline-none"
                        >
                          <option value="equals">Equals</option>
                          <option value="not_equals">Not equals</option>
                          <option value="contains">Contains</option>
                          <option value="not_empty">Is not empty</option>
                        </select>
                        {field.showIf.operator !== 'not_empty' && (
                          <input
                            type="text"
                            value={field.showIf.value || ''}
                            onChange={e => update({ showIf: { ...field.showIf!, value: e.target.value } })}
                            placeholder="Value"
                            className="px-2 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold outline-none"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => update({ showIf: undefined })}
                        className="text-[10px] font-bold text-red-500 hover:underline"
                      >
                        Remove condition
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => update({ showIf: { fieldId: conditionalFields[0]?.id || '', operator: 'equals', value: '' } })}
                      className="px-3 py-2 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-1.5 border border-purple-200"
                    >
                      <Eye size={12} /> Add condition
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
