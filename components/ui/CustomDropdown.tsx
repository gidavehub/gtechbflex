'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';

interface CustomDropdownProps {
  label: string;
  options: readonly string[] | string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  searchable?: boolean;
  icon?: React.ReactNode;
  id?: string;
}

export default function CustomDropdown({
  label, options, value, onChange, placeholder = 'Select an option',
  required = false, error, searchable = false, icon, id,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = searchable && search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (focusedIndex >= 0 && focusedIndex < filtered.length) {
        e.preventDefault();
        onChange(filtered[focusedIndex]);
        setIsOpen(false);
        setSearch('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <div ref={containerRef} className="relative" id={id}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setFocusedIndex(-1); }}
        onKeyDown={handleKeyDown}
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
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || placeholder}
          </span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-gray-400 shrink-0" />
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
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
                  <Search size={14} className="text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">No options found</div>
              ) : (
                filtered.map((option, idx) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all ${
                      value === option
                        ? 'bg-gold-50 text-gold-700'
                        : focusedIndex === idx
                          ? 'bg-gray-50 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{option}</span>
                    {value === option && <Check size={16} className="text-gold-500 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
