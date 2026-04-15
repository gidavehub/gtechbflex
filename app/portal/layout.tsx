'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import PortalSidebar from '@/components/portal/PortalSidebar';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname?.startsWith('/portal/signin') || 
                        pathname?.startsWith('/portal/signup') || 
                        pathname?.startsWith('/portal/verify');

  useEffect(() => {
    if (!isLoading && !firebaseUser && !isPublicRoute) {
      router.push('/portal/signin');
    }
  }, [isLoading, firebaseUser, isPublicRoute, router]);

  if (isLoading || (!firebaseUser && !isPublicRoute)) {
    return <LoadingScreen />;
  }

  // If it's a public route and user isn't logged in, just render the children without the sidebar
  if (isPublicRoute && !firebaseUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <PortalSidebar />
      <main className="lg:pl-72 pt-6 pr-4 pl-4 lg:pr-8 lg:pl-8 pb-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
