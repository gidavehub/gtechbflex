'use client';

import React from 'react';
import { Check, Mail, Phone, Hash, Calendar, Type, AlignLeft, ChevronDown, CircleDot, CheckSquare, List, ListChecks } from 'lucide-react';
import type { FormField, FormFieldCondition } from '@/lib/types';

// ==========================================
// Field Type Icon Map
// ==========================================
const FIELD_ICONS: Record<string, React.ReactNode> = {
  text: <Type size={14} className="text-blue-500" />,
  textarea: <AlignLeft size={14} className="text-indigo-500" />,
  email: <Mail size={14} className="text-rose-500" />,
  phone: <Phone size={14} className="text-emerald-500" />,
  number: <Hash size={14} className="text-amber-500" />,
  select: <ChevronDown size={14} className="text-purple-500" />,
  multiselect: <ListChecks size={14} className="text-teal-500" />,
  radio: <CircleDot size={14} className="text-orange-500" />,
  checkbox: <CheckSquare size={14} className="text-sky-500" />,
  date: <Calendar size={14} className="text-pink-500" />,
};

const FIELD_ACCENT: Record<string, { border: string; ring: string; bg: string; label: string }> = {
  text: { border: 'border-blue-400', ring: 'ring-blue-400/10', bg: 'bg-blue-50', label: 'text-blue-600' },
  textarea: { border: 'border-indigo-400', ring: 'ring-indigo-400/10', bg: 'bg-indigo-50', label: 'text-indigo-600' },
  email: { border: 'border-rose-400', ring: 'ring-rose-400/10', bg: 'bg-rose-50', label: 'text-rose-600' },
  phone: { border: 'border-emerald-400', ring: 'ring-emerald-400/10', bg: 'bg-emerald-50', label: 'text-emerald-600' },
  number: { border: 'border-amber-400', ring: 'ring-amber-400/10', bg: 'bg-amber-50', label: 'text-amber-600' },
  select: { border: 'border-purple-400', ring: 'ring-purple-400/10', bg: 'bg-purple-50', label: 'text-purple-600' },
  multiselect: { border: 'border-teal-400', ring: 'ring-teal-400/10', bg: 'bg-teal-50', label: 'text-teal-600' },
  radio: { border: 'border-orange-400', ring: 'ring-orange-400/10', bg: 'bg-orange-50', label: 'text-orange-600' },
  checkbox: { border: 'border-sky-400', ring: 'ring-sky-400/10', bg: 'bg-sky-50', label: 'text-sky-600' },
  date: { border: 'border-pink-400', ring: 'ring-pink-400/10', bg: 'bg-pink-50', label: 'text-pink-600' },
};

const DEFAULT_ACCENT = { border: 'border-gold-400', ring: 'ring-gold-400/10', bg: 'bg-gold-50', label: 'text-gold-600' };

interface DynamicFormRendererProps {
  fields: FormField[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors?: Record<string, string>;
  readOnly?: boolean;
}

function evaluateCondition(
  condition: FormFieldCondition | undefined,
  values: Record<string, any>
): boolean {
  if (!condition) return true;
  const fieldValue = values[condition.fieldId];
  switch (condition.operator) {
    case 'equals':
      return String(fieldValue || '') === String(condition.value || '');
    case 'not_equals':
      return String(fieldValue || '') !== String(condition.value || '');
    case 'contains':
      return String(fieldValue || '').toLowerCase().includes(String(condition.value || '').toLowerCase());
    case 'not_empty':
      if (Array.isArray(fieldValue)) return fieldValue.length > 0;
      return !!fieldValue && String(fieldValue).trim() !== '';
    default:
      return true;
  }
}

export default function DynamicFormRenderer({
  fields, values, onChange, errors, readOnly = false,
}: DynamicFormRendererProps) {
  if (!fields || fields.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        No form fields configured for this program yet.
      </div>
    );
  }

  // Group fields into rows respecting half-width
  const rows: FormField[][] = [];
  let currentRow: FormField[] = [];

  fields.forEach(field => {
    if (!evaluateCondition(field.showIf, values)) return;

    if (field.type === 'heading' || field.type === 'paragraph' || field.width !== 'half') {
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
      }
      rows.push([field]);
    } else {
      currentRow.push(field);
      if (currentRow.length === 2) {
        rows.push(currentRow);
        currentRow = [];
      }
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  return (
    <div className="space-y-5">
      {rows.map((row, rowIdx) => {
        if (row.length === 1) {
          return <FieldRenderer key={row[0].id} field={row[0]} value={values[row[0].id]} onChange={v => onChange(row[0].id, v)} error={errors?.[row[0].id]} readOnly={readOnly} />;
        }
        return (
          <div key={`row-${rowIdx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {row.map(field => (
              <FieldRenderer key={field.id} field={field} value={values[field.id]} onChange={v => onChange(field.id, v)} error={errors?.[field.id]} readOnly={readOnly} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// Field label with icon + required badge
// ==========================================
function FieldLabel({ field }: { field: FormField }) {
  const icon = FIELD_ICONS[field.type];
  const accent = FIELD_ACCENT[field.type] || DEFAULT_ACCENT;
  const validation = field.validation;

  return (
    <div className="flex items-center gap-2 mb-2">
      {icon && (
        <div className={`w-6 h-6 rounded-lg ${accent.bg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      )}
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex-1">
        {field.label}
      </label>
      <div className="flex items-center gap-1.5 shrink-0">
        {field.required && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600 border border-red-200">
            Required
          </span>
        )}
        {validation?.maxLength && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
            Max {validation.maxLength}
          </span>
        )}
        {validation?.min !== undefined && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
            Min {validation.min}
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Help text + error display
// ==========================================
function FieldFooter({ field, error, charCount }: { field: FormField; error?: string; charCount?: number }) {
  return (
    <>
      {field.helpText && !error && (
        <p className="text-[11px] text-gray-400 mt-1.5 flex items-start gap-1">
          <span className="text-gray-300 mt-px">ℹ</span> {field.helpText}
        </p>
      )}
      {field.validation?.maxLength && charCount !== undefined && (
        <div className="flex justify-end mt-1">
          <span className={`text-[10px] font-bold ${charCount > (field.validation.maxLength * 0.9) ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount} / {field.validation.maxLength}
          </span>
        </div>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1.5 font-bold flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center text-[8px]">!</span>
          {error}
        </p>
      )}
    </>
  );
}

// ==========================================
// Individual field renderer
// ==========================================
function FieldRenderer({
  field, value, onChange, error, readOnly,
}: {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readOnly?: boolean;
}) {
  const accent = FIELD_ACCENT[field.type] || DEFAULT_ACCENT;

  // ---- Heading ----
  if (field.type === 'heading') {
    return (
      <div className="pt-6 pb-2 first:pt-0">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 rounded-full bg-gold-gradient" />
          <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">{field.label}</h3>
        </div>
        <div className="mt-2 h-px bg-gradient-to-r from-gold-300/40 via-gray-200 to-transparent" />
      </div>
    );
  }

  // ---- Paragraph / Instructions ----
  if (field.type === 'paragraph') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/60 rounded-2xl px-5 py-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 rounded-full" />
        <p className="text-xs text-blue-800 leading-relaxed font-medium pl-2">{field.content || field.label}</p>
      </div>
    );
  }

  // ---- Checkbox ----
  if (field.type === 'checkbox') {
    return (
      <div className={`rounded-2xl border-2 p-4 transition-all ${
        value ? 'border-sky-300 bg-sky-50/30' : error ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-all shrink-0 ${
            value ? 'border-sky-500 bg-sky-500' : 'border-gray-300 group-hover:border-sky-400'
          }`}>
            {value && <Check size={12} className="text-white" />}
          </div>
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => !readOnly && onChange(e.target.checked)}
            disabled={readOnly}
            className="sr-only"
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{field.label}</span>
            {field.required && <span className="ml-1 text-[9px] font-black text-red-500 uppercase">Required</span>}
            {field.helpText && <p className="text-[11px] text-gray-400 mt-0.5">{field.helpText}</p>}
          </div>
        </label>
        {error && <FieldFooter field={field} error={error} />}
      </div>
    );
  }

  // ---- Radio ----
  if (field.type === 'radio') {
    return (
      <div>
        <FieldLabel field={field} />
        <div className="space-y-2">
          {(field.options || []).map(opt => (
            <label
              key={opt}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                value === opt
                  ? 'border-orange-400 bg-orange-50/50 ring-2 ring-orange-400/10 shadow-sm'
                  : error
                    ? 'border-red-200 hover:border-red-300 bg-white'
                    : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                value === opt ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
              }`}>
                {value === opt && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`text-sm font-semibold transition-colors ${value === opt ? 'text-orange-800' : 'text-gray-700'}`}>{opt}</span>
              <input type="radio" checked={value === opt} onChange={() => !readOnly && onChange(opt)} disabled={readOnly} className="sr-only" />
            </label>
          ))}
        </div>
        <FieldFooter field={field} error={error} />
      </div>
    );
  }

  // ---- Select ----
  if (field.type === 'select') {
    return (
      <div>
        <FieldLabel field={field} />
        <div className="relative">
          <select
            value={value || ''}
            onChange={e => !readOnly && onChange(e.target.value)}
            disabled={readOnly}
            className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-all appearance-none bg-white cursor-pointer ${
              error
                ? 'border-red-300 bg-red-50/30'
                : value
                  ? `border-gray-200 focus:${accent.border} focus:ring-4 focus:${accent.ring}`
                  : `border-gray-200 bg-gray-50/50 hover:border-gray-300 focus:${accent.border} focus:ring-4 focus:${accent.ring}`
            }`}
          >
            <option value="" className="text-gray-400">{field.placeholder || '— Select an option —'}</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className={`w-6 h-6 rounded-lg ${accent.bg} flex items-center justify-center`}>
              <ChevronDown size={14} className={accent.label} />
            </div>
          </div>
        </div>
        <FieldFooter field={field} error={error} />
      </div>
    );
  }

  // ---- Multi Select ----
  if (field.type === 'multiselect') {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt: string) => {
      if (readOnly) return;
      onChange(selected.includes(opt) ? selected.filter((s: string) => s !== opt) : [...selected, opt]);
    };
    return (
      <div>
        <FieldLabel field={field} />
        <div className="flex flex-wrap gap-2">
          {(field.options || []).map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                selected.includes(opt)
                  ? 'bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-500/20'
                  : error
                    ? 'bg-white text-gray-600 border-red-200 hover:border-red-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {selected.includes(opt) && <Check size={12} className="inline mr-1.5" />}
              {opt}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <p className="text-[10px] text-teal-600 font-bold mt-1.5">{selected.length} selected</p>
        )}
        <FieldFooter field={field} error={error} />
      </div>
    );
  }

  // ---- Textarea ----
  if (field.type === 'textarea') {
    const maxLen = field.validation?.maxLength;
    const charCount = String(value || '').length;
    return (
      <div>
        <FieldLabel field={field} />
        <textarea
          value={value || ''}
          onChange={e => !readOnly && onChange(e.target.value)}
          disabled={readOnly}
          placeholder={field.placeholder}
          maxLength={maxLen}
          rows={4}
          className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm font-medium outline-none transition-all resize-none ${
            error
              ? 'border-red-300 bg-red-50/30'
              : value
                ? `border-gray-200 bg-white focus:${accent.border} focus:ring-4 focus:${accent.ring}`
                : `border-gray-200 bg-gray-50/50 focus:${accent.border} focus:ring-4 focus:${accent.ring}`
          }`}
        />
        <FieldFooter field={field} error={error} charCount={maxLen ? charCount : undefined} />
      </div>
    );
  }

  // ---- Date ----
  if (field.type === 'date') {
    return (
      <div>
        <FieldLabel field={field} />
        <div className="relative">
          <input
            type="date"
            value={value || ''}
            onChange={e => !readOnly && onChange(e.target.value)}
            disabled={readOnly}
            className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-all ${
              error
                ? 'border-red-300 bg-red-50/30'
                : value
                  ? `border-gray-200 bg-white focus:${accent.border} focus:ring-4 focus:${accent.ring}`
                  : `border-gray-200 bg-gray-50/50 focus:${accent.border} focus:ring-4 focus:${accent.ring}`
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className={`w-6 h-6 rounded-lg ${accent.bg} flex items-center justify-center`}>
              <Calendar size={14} className={accent.label} />
            </div>
          </div>
        </div>
        <FieldFooter field={field} error={error} />
      </div>
    );
  }

  // ---- Default: text, email, phone, number ----
  const inputType = field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : 'text';
  const fieldIcon = FIELD_ICONS[field.type];

  return (
    <div>
      <FieldLabel field={field} />
      <div className="relative">
        {fieldIcon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg ${accent.bg} flex items-center justify-center pointer-events-none z-10`}>
            {fieldIcon}
          </div>
        )}
        <input
          type={inputType}
          value={value ?? ''}
          onChange={e => !readOnly && onChange(field.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
          disabled={readOnly}
          placeholder={field.placeholder}
          maxLength={field.validation?.maxLength}
          minLength={field.validation?.minLength}
          min={field.validation?.min}
          max={field.validation?.max}
          className={`w-full ${fieldIcon ? 'pl-12' : 'px-4'} pr-4 py-3.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-all ${
            error
              ? 'border-red-300 bg-red-50/30'
              : value
                ? `border-gray-200 bg-white focus:${accent.border} focus:ring-4 focus:${accent.ring}`
                : `border-gray-200 bg-gray-50/50 hover:border-gray-300 focus:${accent.border} focus:ring-4 focus:${accent.ring}`
          }`}
        />
      </div>
      <FieldFooter field={field} error={error} />
    </div>
  );
}
