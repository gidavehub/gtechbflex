'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, GraduationCap, BarChart3, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
  { href: '/admin/programs', label: 'Programs', icon: GraduationCap },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 glass-card-strong flex flex-col rounded-3xl shadow-xl z-[110] hidden lg:flex">
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden">
            <Image src="/logo.webp" alt="G-Tech" width={36} height={36} className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">B-<span className="text-gold-gradient">Flex</span></span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-2">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-1">
        <Link href="/">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all">
            <Home size={18} /> Home
          </div>
        </Link>
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
