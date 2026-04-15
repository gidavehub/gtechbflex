'use client';

import React, { useState } from 'react';

interface CustomTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  rows?: number;
  id?: string;
}

export default function CustomTextarea({
  label, value, onChange, placeholder = '', required = false,
  error, maxLength = 1000, rows = 4, id,
}: CustomTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div id={id}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <span className={`text-xs font-medium ${value.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
          {value.length}/{maxLength}
        </span>
      </div>
      <div
        className={`rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? 'border-gold-400 ring-4 ring-gold-400/10 bg-white'
            : error
              ? 'border-red-300 bg-red-50/50'
              : value
                ? 'border-gray-200 bg-white'
                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
        }`}
      >
        <textarea
          value={value}
          onChange={e => {
            if (e.target.value.length <= maxLength) onChange(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="w-full px-4 py-3.5 bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none resize-none"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
