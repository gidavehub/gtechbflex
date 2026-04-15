'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl overflow-hidden shadow-gold-lg"
        >
          <Image src="/logo.webp" alt="G-Tech" width={80} height={80} className="w-full h-full object-contain" />
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">
            B-<span className="text-gold-gradient">Flex</span>
          </h1>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-gold-400"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
