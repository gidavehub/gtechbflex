'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { getApplications } from '@/lib/firestore';
import type { Application } from '@/lib/types';

export default function AnalyticsPage() {
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    const load = async () => {
      try { setApps(await getApplications()); } catch {}
    };
    load();
  }, []);

  // Compute distributions
  const genderDist = countBy(apps, 'gender');
  const sectorDist = countBy(apps, 'business_sector');
  const regionDist = countBy(apps, 'region');
  const statusDist = countBy(apps, 'status');
  const formalDist = countBy(apps, 'formalization_status');

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">{apps.length} total applications analyzed</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <ChartCard title="Gender Distribution" data={genderDist} colors={['#D4A843', '#2563EB', '#16A34A']} />
        <ChartCard title="Application Status" data={statusDist} colors={['#F59E0B', '#10B981', '#EF4444', '#9CA3AF']} />
        <ChartCard title="Business Sector" data={sectorDist} colors={['#D4A843', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4', '#EC4899']} />
        <ChartCard title="Region Distribution" data={regionDist} colors={['#D4A843', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4', '#EC4899']} />
        <ChartCard title="Formalization Status" data={formalDist} colors={['#D4A843', '#6B7280']} />
      </div>
    </div>
  );
}

function countBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const val = item[key] || 'Unknown';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function ChartCard({ title, data, colors }: { title: string; data: Record<string, number>; colors: string[] }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-gold-500" />{title}</h3>
        <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-gold-500" />{title}
      </h3>
      <div className="space-y-3">
        {entries.map(([label, count], idx) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const color = colors[idx % colors.length];
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 truncate max-w-[60%]">{label.replace('_', ' ')}</span>
                <span className="font-bold text-gray-900">{count} <span className="text-gray-400 font-medium">({pct}%)</span></span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / max) * 100}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
