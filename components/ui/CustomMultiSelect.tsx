'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface CustomMultiSelectProps {
  label: string;
  options: readonly string[] | string[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  error?: string;
  id?: string;
}

export default function CustomMultiSelect({
  label, options, value, onChange, required = false, error, id,
}: CustomMultiSelectProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div id={id}>
      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selected pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map(v => (
            <motion.button
              key={v}
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => toggle(v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-400 text-white text-xs font-bold shadow-gold transition-all hover:bg-gold-500"
            >
              {v}
              <X size={12} />
            </motion.button>
          ))}
        </div>
      )}

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(option => {
          const isSelected = value.includes(option);
          return (
            <motion.button
              key={option}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(option)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left text-sm font-medium transition-all duration-300 ${
                isSelected
                  ? 'border-gold-400 bg-gold-50 text-gold-700'
                  : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                isSelected
                  ? 'border-gold-400 bg-gold-400'
                  : 'border-gray-300'
              }`}>
                {isSelected && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                )}
              </div>
              <span>{option}</span>
            </motion.button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
