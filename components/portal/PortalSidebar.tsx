'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, GraduationCap, FileText, User, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/programs', label: 'Programs', icon: GraduationCap },
  { href: '/portal/applications', label: 'My Applications', icon: FileText },
  { href: '/portal/profile', label: 'Profile', icon: User },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { portalUser, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 glass-card-strong flex flex-col rounded-3xl shadow-xl z-[110] hidden lg:flex">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden">
            <Image src="/logo.webp" alt="G-Tech" width={36} height={36} className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">B-<span className="text-gold-gradient">Flex</span></span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-2">Portal</span>
          </div>
        </Link>
      </div>

      {/* User info */}
      {portalUser && (
        <div className="mx-6 mb-4 p-3 rounded-2xl bg-gold-50 border border-gold-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-400 flex items-center justify-center text-white text-sm font-bold">
              {portalUser.first_name[0]}{portalUser.last_name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{portalUser.first_name} {portalUser.last_name}</p>
              <p className="text-[10px] text-gray-500 truncate">{portalUser.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gold-400 text-white shadow-gold'
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

      {/* Footer actions */}
      <div className="p-4 space-y-1">
        <Link href="/">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
            <Home size={18} />
            Back to Home
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
