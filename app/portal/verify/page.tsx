'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newCode.every(c => c) && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    if (pasted.length === 6) handleVerify(pasted);
  };

  const handleVerify = async (fullCode: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/email/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        toast({ title: 'Email verified!', description: 'Welcome to B-Flex.', type: 'success' });
        router.push('/portal');
      } else {
        toast({ title: 'Invalid code', description: data.error || 'Please try again.', type: 'error' });
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast({ title: 'Verification failed', type: 'error' });
    }
    setSubmitting(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch('/api/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: '' }),
      });
      toast({ title: 'Code resent!', description: 'Check your email.', type: 'success' });
    } catch {
      toast({ title: 'Failed to resend', type: 'error' });
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[10%] left-[5%] w-80 h-80 bg-gold-400/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden text-center px-8 py-10">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-gold-lg mb-4">
            <Image src="/logo.webp" alt="G-Tech" width={64} height={64} className="w-full h-full object-contain" />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-sm text-gray-500 mb-8">
            We sent a 6-digit code to <strong className="text-gray-700">{email || 'your email'}</strong>
          </p>

          {/* OTP inputs */}
          <div className="flex items-center justify-center gap-3 mb-8" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <motion.input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`w-12 h-14 rounded-2xl border-2 text-center text-xl font-bold outline-none transition-all ${
                  digit
                    ? 'border-gold-400 bg-gold-50 text-gold-700'
                    : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/10'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify(code.join(''))}
            disabled={submitting || code.some(c => !c)}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 mb-4"
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify <CheckCircle size={16} /></>}
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-gold-500 mx-auto transition-colors"
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            Resend Code
          </button>
        </div>
      </motion.div>
    </div>
  );
}
