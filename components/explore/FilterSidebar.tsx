'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Filter } from 'lucide-react';
import { PROGRAM_TYPES, BUSINESS_SECTORS } from '@/lib/types';

interface FilterSidebarProps {
  filters: {
    type?: string;
    sector?: string;
    status?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FilterSidebar({ filters, onFiltersChange, isOpen, onToggle }: FilterSidebarProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => onFiltersChange({});

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <>
      {/* Mobile toggle */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold-400 text-white shadow-gold-lg flex items-center justify-center"
      >
        <Filter size={22} />
      </motion.button>

      {/* Sidebar */}
      <aside className={`fixed left-4 top-20 bottom-4 w-64 glass-card-strong flex flex-col p-6 z-[110] transition-all duration-300 overflow-y-auto rounded-3xl shadow-xl custom-scrollbar ${
        !isOpen ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-gold-500" />
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:underline">
                Clear All
              </button>
            )}
          </div>

          {/* Program Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Program Type</label>
            <div className="space-y-1.5">
              {PROGRAM_TYPES.map(type => (
                <motion.button
                  key={type.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateFilter('type', filters.type === type.value ? undefined : type.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                    filters.type === type.value
                      ? 'bg-gold-400 text-white shadow-gold'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
            <div className="space-y-1.5">
              {[
                { value: 'open', label: 'Open for Applications', color: 'emerald' },
                { value: 'closed', label: 'Closed', color: 'gray' },
              ].map(option => (
                <motion.button
                  key={option.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateFilter('status', filters.status === option.value ? undefined : option.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                    filters.status === option.value
                      ? 'bg-gold-400 text-white shadow-gold'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sector</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {BUSINESS_SECTORS.slice(0, 8).map(sector => (
                <motion.button
                  key={sector}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateFilter('sector', filters.sector === sector ? undefined : sector)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                    filters.sector === sector
                      ? 'bg-gold-400 text-white shadow-gold'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {sector}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Active filters count */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-gold-50 border border-gold-200">
                <span className="text-xs font-bold text-gold-700">
                  {Object.values(filters).filter(Boolean).length} Active
                </span>
                <button onClick={clearFilters} className="w-6 h-6 rounded-full bg-gold-400 text-white flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          onClick={onToggle}
        />
      )}
    </>
  );
}
