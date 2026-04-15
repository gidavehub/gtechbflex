'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Users, Calendar } from 'lucide-react';
import { getActivePrograms } from '@/lib/firestore';
import type { Program } from '@/lib/types';

const typeLabels: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

export default function PortalProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActivePrograms();
        setPrograms(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Available Programs</h1>
        <p className="text-sm text-gray-500">Browse and apply to programs</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-shimmer h-48" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <GraduationCap size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Programs Available</h3>
          <p className="text-sm text-gray-500">Check back soon for new programs.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gold-200/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gold-50 text-gold-600 border border-gold-200">
                  {typeLabels[program.program_type]}
                </span>
                {program.is_applications_open ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-gold" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-gold-600 transition-colors mb-2 line-clamp-2">
                {program.title}
              </h3>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{program.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                {program.start_date && (
                  <span className="flex items-center gap-1"><Calendar size={12} />{program.start_date}</span>
                )}
                <span className="flex items-center gap-1"><Users size={12} />{program.max_participants - (program.current_participants || 0)} spots</span>
              </div>
              <Link
                href={program.is_applications_open ? `/portal/apply/${program.id}` : `/programs/${program.id}`}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  program.is_applications_open
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {program.is_applications_open ? 'Apply Now' : 'View Details'} <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
