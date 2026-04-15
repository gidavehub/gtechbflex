'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`relative ${maxWidth} w-full bg-white rounded-3xl shadow-2xl overflow-hidden`}
      >
        {title && (
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}
