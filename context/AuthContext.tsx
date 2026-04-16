'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getUser, getUserByEmail } from '@/lib/firestore';
import type { PortalUser } from '@/lib/types';

// Custom user type for admin auth
export interface CustomUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  firebaseUser: CustomUser | null;
  portalUser: PortalUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<CustomUser | null>(null);
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPortalUser = useCallback(async (uid: string) => {
    try {
      const profile = await getUser(uid);
      setPortalUser(profile);
      if (profile) {
        setFirebaseUser({ uid: profile.uid, email: profile.email });
      } else {
        setFirebaseUser(null);
      }
    } catch {
      setPortalUser(null);
      setFirebaseUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedUid = localStorage.getItem('bflex_uid');
      if (storedUid) {
        await loadPortalUser(storedUid);
      }
      setIsLoading(false);
    };
    initAuth();
  }, [loadPortalUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const userDoc = await getUserByEmail(email);
      if (!userDoc) {
        return { error: 'Account not found' };
      }
      // Only allow admin sign-in
      if (userDoc.role !== 'admin') {
        return { error: 'This login is for administrators only' };
      }
      // Simple exact match (since we're restricted to pure Firestore)
      if ((userDoc as any).password !== password) {
        return { error: 'Invalid password' };
      }

      localStorage.setItem('bflex_uid', userDoc.uid);
      await loadPortalUser(userDoc.uid);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('bflex_uid');
    setFirebaseUser(null);
    setPortalUser(null);
  };

  const refreshUser = async () => {
    const storedUid = localStorage.getItem('bflex_uid');
    if (storedUid) {
      await loadPortalUser(storedUid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        portalUser,
        isLoading,
        isAdmin: portalUser?.role === 'admin',
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
