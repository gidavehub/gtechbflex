'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomCalendarProps {
  label: string;
  value: number | null;
  onChange: (year: number) => void;
  required?: boolean;
  error?: string;
  minYear?: number;
  maxYear?: number;
  id?: string;
}

export default function CustomCalendar({
  label, value, onChange, required = false, error,
  minYear = 1980, maxYear = new Date().getFullYear(), id,
}: CustomCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [decade, setDecade] = useState(Math.floor((value || maxYear) / 10) * 10);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const years = Array.from({ length: 12 }, (_, i) => decade - 1 + i);

  return (
    <div ref={containerRef} className="relative" id={id}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 text-left text-sm font-medium transition-all duration-300 outline-none ${
          isOpen
            ? 'border-gold-400 ring-4 ring-gold-400/10 bg-white'
            : error
              ? 'border-red-300 bg-red-50/50'
              : value
                ? 'border-gray-200 bg-white'
                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || 'Select year'}
          </span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronLeft size={18} className="rotate-[-90deg] text-gray-400" />
        </motion.div>
      </button>

      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden p-4"
          >
            {/* Decade navigator */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setDecade(d => Math.max(d - 10, Math.floor(minYear / 10) * 10))}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              <span className="text-sm font-bold text-gray-900">
                {decade} – {decade + 9}
              </span>
              <button
                type="button"
                onClick={() => setDecade(d => Math.min(d + 10, Math.floor(maxYear / 10) * 10))}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Year grid */}
            <div className="grid grid-cols-4 gap-2">
              {years.map(year => {
                const isDisabled = year < minYear || year > maxYear;
                const isSelected = value === year;
                return (
                  <button
                    key={year}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(year);
                      setIsOpen(false);
                    }}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-gold-400 text-white shadow-gold'
                        : isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gold-50 hover:text-gold-700'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
