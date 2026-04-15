'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, GraduationCap, Briefcase, Users, TrendingUp } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProgramCard from '@/components/explore/ProgramCard';
import FilterSidebar from '@/components/explore/FilterSidebar';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getActivePrograms } from '@/lib/firestore';
import type { Program } from '@/lib/types';



export default function HomePage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActivePrograms();
        setPrograms(data);
      } catch (err) {
        console.error("Error loading programs", err);
        setPrograms([]);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // Filter and search
  const filteredPrograms = useMemo(() => {
    let result = programs;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.program_type.toLowerCase().includes(q)
      );
    }

    if (filters.type) {
      result = result.filter(p => p.program_type === filters.type);
    }

    if (filters.status) {
      result = result.filter(p =>
        filters.status === 'open' ? p.is_applications_open : !p.is_applications_open
      );
    }

    if (filters.sector) {
      result = result.filter(p => p.sector === filters.sector);
    }

    return result;
  }, [programs, searchQuery, filters]);

  if (isLoading) return <LoadingScreen />;

  const stats = [
    { icon: GraduationCap, value: programs.length, label: 'Programs' },
    { icon: Users, value: programs.reduce((s, p) => s + (p.current_participants || 0), 0), label: 'Participants' },
    { icon: Briefcase, value: programs.filter(p => p.is_applications_open).length, label: 'Open Now' },
    { icon: TrendingUp, value: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="lg:pl-72 pt-20 pr-4 pl-4 lg:pr-6 lg:pl-6 pb-6 min-h-screen transition-all duration-300">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-10 mb-6 text-white"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gold-400/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-gold-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">B-Flex Registration Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Explore <span className="text-gold-gradient">Programs</span>
            </h1>
            <p className="text-sm text-white/60 max-w-lg mb-6">
              Find and apply to mentorship, investment readiness, business linkage, incubation, and acceleration programs across Gambia.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-sm"
                >
                  <stat.icon size={16} className="text-gold-400 mx-auto mb-1" />
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main content card */}
        <div className="glass-card-strong rounded-3xl p-6 min-h-[60vh]">
          {/* Search bar */}
          <div className="mb-6">
            <div className="flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-400/10 overflow-hidden transition-all">
              <div className="pl-4">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search programs by name, type, or keyword..."
                className="flex-1 px-4 py-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredPrograms.length} Program{filteredPrograms.length !== 1 ? 's' : ''} Available
            </h2>
          </div>

          {/* Programs grid */}
          <AnimatePresence mode="wait">
            {filteredPrograms.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {filteredPrograms.map((program, index) => (
                  <ProgramCard key={program.id} program={program} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-5">
                  <GraduationCap size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Programs Found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your search or filters to find programs.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setFilters({}); }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="lg:pl-72">
        <Footer />
      </div>
    </div>
  );
}
