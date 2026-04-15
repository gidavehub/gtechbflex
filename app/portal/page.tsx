'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, FileText, Clock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApplicationsByUser } from '@/lib/firestore';
import type { Application } from '@/lib/types';

export default function PortalDashboard() {
  const { portalUser } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (portalUser?.uid) {
        try {
          const data = await getApplicationsByUser(portalUser.uid);
          setApps(data);
        } catch {}
      }
      setLoading(false);
    };
    load();
  }, [portalUser]);

  const underReview = apps.filter(a => a.status === 'under_review').length;
  const accepted = apps.filter(a => a.status === 'accepted').length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, {portalUser?.first_name || 'there'}! 👋
          </h1>
          <p className="text-sm text-white/60">
            {apps.length > 0
              ? `You have ${underReview} application${underReview !== 1 ? 's' : ''} under review.`
              : 'Start exploring programs and submit your first application.'}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FileText, label: 'Total Applications', value: apps.length, color: 'bg-blue-500' },
          { icon: Clock, label: 'Under Review', value: underReview, color: 'bg-amber-500' },
          { icon: CheckCircle, label: 'Accepted', value: accepted, color: 'bg-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/portal/programs">
          <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gold-300/50 transition-all group cursor-pointer">
            <GraduationCap size={24} className="text-gold-500 mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-gold-600 transition-colors">Browse Programs</h3>
            <p className="text-xs text-gray-500 mb-3">Find and apply to available programs</p>
            <span className="flex items-center gap-1 text-sm font-bold text-gold-500">
              Explore <ArrowRight size={14} />
            </span>
          </motion.div>
        </Link>
        <Link href="/portal/applications">
          <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gold-300/50 transition-all group cursor-pointer">
            <FileText size={24} className="text-blue-500 mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-gold-600 transition-colors">My Applications</h3>
            <p className="text-xs text-gray-500 mb-3">Track your application status</p>
            <span className="flex items-center gap-1 text-sm font-bold text-gold-500">
              View All <ArrowRight size={14} />
            </span>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
