'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApplicationsByUser } from '@/lib/firestore';
import type { Application } from '@/lib/types';

const statusConfig: Record<string, { icon: any; label: string; class: string }> = {
  under_review: { icon: Clock, label: 'Under Review', class: 'badge-under-review' },
  accepted: { icon: CheckCircle, label: 'Accepted', class: 'badge-accepted' },
  rejected: { icon: XCircle, label: 'Rejected', class: 'badge-rejected' },
  withdrawn: { icon: FileText, label: 'Withdrawn', class: 'badge-withdrawn' },
};

export default function ApplicationsPage() {
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

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
        <p className="text-sm text-gray-500">Track your application status</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-shimmer h-24" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <FileText size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-sm text-gray-500 mb-6">Start by exploring available programs.</p>
          <Link href="/portal/programs" className="btn-primary inline-flex items-center gap-2">
            Browse Programs <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app, index) => {
            const status = statusConfig[app.status] || statusConfig.under_review;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gold-200/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-gold-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{app.business_name || app.full_name}</h3>
                      <p className="text-xs text-gray-400">
                        Applied {app.created_at?.toDate ? new Date(app.created_at.toDate()).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${status.class} flex items-center gap-1.5`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
