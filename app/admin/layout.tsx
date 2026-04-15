'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!firebaseUser || !isAdmin)) {
      router.push('/portal/signin');
    }
  }, [isLoading, firebaseUser, isAdmin, router]);

  if (isLoading || !firebaseUser || !isAdmin) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="lg:pl-72 pt-6 pr-4 pl-4 lg:pr-8 lg:pl-8 pb-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
