'use client';

import React, { useState } from 'react';

interface CustomInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  id?: string;
  disabled?: boolean;
}

export default function CustomInput({
  label, value, onChange, type = 'text', placeholder = '',
  required = false, error, icon, readOnly = false, maxLength, minLength, id, disabled,
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div id={id}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? 'border-gold-400 ring-4 ring-gold-400/10 bg-white'
            : error
              ? 'border-red-300 bg-red-50/50'
              : readOnly
                ? 'border-gray-100 bg-gray-50'
                : value
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
        }`}
      >
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
