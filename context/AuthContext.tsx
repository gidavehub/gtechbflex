'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUser, getUserByEmail, createUser } from '@/lib/firestore';
import type { PortalUser } from '@/lib/types';

// Mock Firebase User type to keep compatibility with rest of app
export interface CustomUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  firebaseUser: CustomUser | null;
  portalUser: PortalUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: { first_name: string; last_name: string; email: string; password: string }) => Promise<{ error?: string }>;
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
      // Simple exact match (since we're restricted to pure FireStore)
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

  const signUp = async (data: { first_name: string; last_name: string; email: string; password: string }) => {
    try {
      const existing = await getUserByEmail(data.email);
      if (existing) {
        return { error: 'Email already in use' };
      }

      // Generate random ID
      const newUid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      
      await setDoc(doc(db, 'users', newUid), {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email.toLowerCase(),
        password: data.password, // Plain storage based on pure Firestore architecture requirement
        role: 'user',
        verified: false,
        created_at: new Date(),
        updated_at: new Date()
      });

      localStorage.setItem('bflex_uid', newUid);
      await loadPortalUser(newUid);

      // Send OTP via API route
      try {
        await fetch('/api/email/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, name: data.first_name }),
        });
      } catch {}
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to create account' };
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
        isVerified: portalUser?.verified ?? false,
        signIn,
        signUp,
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
