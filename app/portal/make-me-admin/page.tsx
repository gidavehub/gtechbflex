'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sparkles } from 'lucide-react';

export default function MakeMeAdminPage() {
  const { firebaseUser, portalUser, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMakeAdmin = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        role: 'admin'
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to update role. Make sure you are logged in.');
    }
    setLoading(false);
  };

  if (!firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Please sign in first.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-gray-100">
        <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold-200">
          <Sparkles size={32} className="text-gold-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Seed Admin</h1>
        <p className="text-sm text-gray-500 mb-6">
          Click the button below to grant admin privileges to <strong className="text-gray-800">{portalUser?.email}</strong>.
        </p>

        {success ? (
          <div className="text-emerald-600 font-bold bg-emerald-50 py-3 rounded-xl">
            Success! Redirecting...
          </div>
        ) : (
          <button
            onClick={handleMakeAdmin}
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Make Me Admin'}
          </button>
        )}
        
        <p className="text-xs text-center text-gray-400 mt-4">
          Remember to delete <code className="bg-gray-100 p-1 rounded">app/portal/make-me-admin/page.tsx</code> from the codebase after using this!
        </p>
      </div>
    </div>
  );
}
