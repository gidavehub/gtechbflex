'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Calendar, MapPin } from 'lucide-react';
import type { Program } from '@/lib/types';

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  mentorship: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  investment_readiness: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  business_linkage: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  incubation: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  acceleration: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const typeLabels: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

interface ProgramCardProps {
  program: Program;
  index: number;
}

export default function ProgramCard({ program, index }: ProgramCardProps) {
  const colors = typeColors[program.program_type] || typeColors.mentorship;
  const spotsLeft = program.max_participants - (program.current_participants || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="card-hover"
    >
      <Link href={`/programs/${program.id}`}>
        <div className="h-full p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gold-300/50 transition-all cursor-pointer group relative overflow-hidden">
          {/* Accent gradient top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
              {typeLabels[program.program_type] || program.program_type}
            </div>
            {program.is_applications_open ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                Open
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                Closed
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gold-600 transition-colors mb-2 line-clamp-2">
            {program.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-5 line-clamp-3 leading-relaxed">
            {program.description}
          </p>

          {/* Meta info */}
          <div className="space-y-2 mb-5">
            {program.start_date && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={13} />
                <span>Starts {program.start_date}</span>
              </div>
            )}
            {program.location && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={13} />
                <span>{program.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Users size={13} />
              <span>
                {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Fully booked'}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {program.sector || 'Multi-Sector'}
            </span>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-1.5 text-sm font-bold text-gold-500 group-hover:text-gold-600 transition-colors"
            >
              View Details
              <ArrowRight size={14} />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
