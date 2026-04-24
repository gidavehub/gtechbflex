'use client';

import React from 'react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden">
              <Image src="/logo.webp" alt="Gambia Tech" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              B-<span className="text-gold-gradient">Flex</span>
            </span>
            <span className="text-xs text-gray-400 ml-2">by Gambia Tech</span>
          </div>
          <span className="text-xs text-gray-500">© {new Date().getFullYear()} Gambia Tech. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
