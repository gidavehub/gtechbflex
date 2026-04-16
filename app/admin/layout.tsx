'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname?.startsWith('/admin/login');

  useEffect(() => {
    if (!isLoading && (!firebaseUser || !isAdmin) && !isLoginRoute) {
      router.push('/admin/login');
    }
  }, [isLoading, firebaseUser, isAdmin, isLoginRoute, router]);

  // Login page — render without sidebar
  if (isLoginRoute) {
    return <>{children}</>;
  }

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
