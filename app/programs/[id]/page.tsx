'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Calendar, MapPin, Users, CheckCircle,
  GraduationCap, Briefcase, Target, TrendingUp, Share2
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getProgram } from '@/lib/firestore';
import type { Program } from '@/lib/types';

const typeIcons: Record<string, any> = {
  mentorship: GraduationCap,
  investment_readiness: TrendingUp,
  business_linkage: Briefcase,
  incubation: Target,
  acceleration: TrendingUp,
};

const typeLabels: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

export default function ProgramDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await getProgram(id);
        setProgram(data);
      } catch {
        // Demo fallback
      }
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isLoading) return <LoadingScreen />;

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="pt-24 text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-5">
            <GraduationCap size={32} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Program Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">This program may have been removed or the link is incorrect.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  const Icon = typeIcons[program.program_type] || GraduationCap;
  const spotsLeft = program.max_participants - (program.current_participants || 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="pt-20 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to Programs
          </Link>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12 mb-8 text-white"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <Icon size={24} className="text-gold-400" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
                  {typeLabels[program.program_type]}
                </span>
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">{program.title}</h1>
            <p className="text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">{program.description}</p>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-3 mt-6">
              {program.start_date && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
                  <Calendar size={14} className="text-gold-400" />
                  {program.start_date}
                </div>
              )}
              {program.location && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
                  <MapPin size={14} className="text-gold-400" />
                  {program.location}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
                <Users size={14} className="text-gold-400" />
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          {program.is_applications_open && spotsLeft > 0 ? (
            <Link
              href={`/programs/${program.id}/apply`}
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
            >
              Apply Now <ArrowRight size={18} />
            </Link>
          ) : (
            <button disabled className="btn-primary opacity-50 cursor-not-allowed inline-flex items-center gap-2 text-base px-8 py-4">
              Applications Closed
            </button>
          )}
          <button
            onClick={handleShare}
            className="btn-secondary inline-flex items-center gap-2 px-6 py-4"
          >
            <Share2 size={16} />
            {copied ? 'Link Copied!' : 'Share Program'}
          </button>
        </motion.div>

        {/* Details card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle size={20} className="text-gold-500" />
            Program Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoRow label="Program Type" value={typeLabels[program.program_type]} />
              <InfoRow label="Sector" value={program.sector || 'Multi-Sector'} />
              <InfoRow label="Start Date" value={program.start_date || 'TBA'} />
              <InfoRow label="Location" value={program.location || 'TBA'} />
            </div>
            <div className="space-y-4">
              <InfoRow label="Max Participants" value={String(program.max_participants)} />
              <InfoRow label="Current Participants" value={String(program.current_participants || 0)} />
              <InfoRow label="Spots Remaining" value={spotsLeft > 0 ? String(spotsLeft) : 'None'} />
              <InfoRow label="Status" value={program.is_applications_open ? '✅ Open' : '🔒 Closed'} />
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-gray-900 text-right">{value}</span>
    </div>
  );
}
