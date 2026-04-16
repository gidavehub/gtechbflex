'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { firebaseUser, isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <Image src="/logo.webp" alt="G-Tech" width={36} height={36} className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              B-<span className="text-gold-gradient">Flex</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {firebaseUser && isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-gold-400 text-white shadow-gold hover:shadow-gold-lg transition-all hover:-translate-y-0.5"
              >
                <LayoutDashboard size={16} />
                Admin Panel
              </Link>
            )}
            {(!firebaseUser || !isAdmin) && (
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Shield size={12} />
                Admin
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="p-4 space-y-2">
              {firebaseUser && isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gold-400 shadow-gold transition-all"
                >
                  <LayoutDashboard size={16} />
                  Admin Panel
                </Link>
              )}
              {(!firebaseUser || !isAdmin) && (
                <Link
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
                >
                  <Shield size={14} />
                  Admin Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
