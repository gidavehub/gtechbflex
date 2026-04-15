'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import CustomInput from '@/components/ui/CustomInput';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      toast({ title: 'Please fill in all required fields', type: 'error' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Passwords do not match', type: 'error' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setSubmitting(true);
    const { error } = await signUp({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      password: form.password,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Registration failed', description: error, type: 'error' });
    } else {
      toast({ title: 'Account created!', description: 'Check your email for a verification code.', type: 'success' });
      router.push(`/portal/verify?email=${encodeURIComponent(form.email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[10%] left-[5%] w-80 h-80 bg-gold-400/10 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="text-center pt-10 pb-4 px-8">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-gold-lg mb-4">
              <Image src="/logo.webp" alt="G-Tech" width={64} height={64} className="w-full h-full object-contain" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">
              B-<span className="text-gold-gradient">Flex</span>
              <span className="text-sm font-normal text-gray-400 ml-2">Portal</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1.5">
              Create your account to get started
            </p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <CustomInput label="First Name" value={form.first_name} onChange={v => set('first_name', v)} required placeholder="John" id="signup-firstname" />
                <CustomInput label="Last Name" value={form.last_name} onChange={v => set('last_name', v)} required placeholder="Doe" id="signup-lastname" />
              </div>
              <CustomInput label="Email Address" type="email" value={form.email} onChange={v => set('email', v)} required placeholder="you@example.com" id="signup-email" />
              <div>
                <CustomInput label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={v => set('password', v)} required placeholder="Min 6 characters" minLength={6} id="signup-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 mt-1 transition-colors">
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <CustomInput label="Confirm Password" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={v => set('confirmPassword', v)} required placeholder="Re-enter password" id="signup-confirm" />

              <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base mt-2 disabled:opacity-50">
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/portal/signin" className="text-gold-500 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
