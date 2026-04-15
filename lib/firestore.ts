import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, Timestamp, setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { Program, Application, PortalUser } from './types';

// ==========================================
// PROGRAMS
// ==========================================
export async function getPrograms(): Promise<Program[]> {
  const q = query(collection(db, 'programs'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Program));
}

export async function getActivePrograms(): Promise<Program[]> {
  const q = query(
    collection(db, 'programs'),
    where('is_active', '==', true),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Program));
}

export async function getProgram(id: string): Promise<Program | null> {
  const snap = await getDoc(doc(db, 'programs', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Program;
}

export async function createProgram(data: Omit<Program, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const ref = await addDoc(collection(db, 'programs'), {
    ...data,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  });
  return ref.id;
}

export async function updateProgram(id: string, data: Partial<Program>): Promise<void> {
  await updateDoc(doc(db, 'programs', id), {
    ...data,
    updated_at: Timestamp.now(),
  });
}

// ==========================================
// APPLICATIONS
// ==========================================
export async function getApplications(): Promise<Application[]> {
  const q = query(collection(db, 'applications'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
}

export async function getApplicationsByUser(userId: string): Promise<Application[]> {
  const q = query(
    collection(db, 'applications'),
    where('portal_user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
}

export async function getApplicationsByProgram(programId: string): Promise<Application[]> {
  const q = query(
    collection(db, 'applications'),
    where('program_id', '==', programId),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
}

export async function getApplication(id: string): Promise<Application | null> {
  const snap = await getDoc(doc(db, 'applications', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Application;
}

export async function createApplication(data: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const ref = await addDoc(collection(db, 'applications'), {
    ...data,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  });
  return ref.id;
}

export async function updateApplication(id: string, data: Partial<Application>): Promise<void> {
  await updateDoc(doc(db, 'applications', id), {
    ...data,
    updated_at: Timestamp.now(),
  });
}

export async function checkExistingApplication(programId: string, userId: string): Promise<boolean> {
  const q = query(
    collection(db, 'applications'),
    where('program_id', '==', programId),
    where('portal_user_id', '==', userId)
  );
  const snap = await getDocs(q);
  // Filter out withdrawn/rejected
  const active = snap.docs.filter(d => {
    const status = d.data().status;
    return status !== 'withdrawn' && status !== 'rejected';
  });
  return active.length > 0;
}

// ==========================================
// USERS
// ==========================================
export async function getUser(uid: string): Promise<PortalUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as PortalUser;
}

export async function createUser(uid: string, data: Omit<PortalUser, 'uid' | 'created_at' | 'updated_at'>): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  });
}

export async function updateUser(uid: string, data: Partial<PortalUser>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updated_at: Timestamp.now(),
  });
}

export async function getAllUsers(): Promise<PortalUser[]> {
  const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as PortalUser));
}

export async function getUserByEmail(email: string): Promise<PortalUser | null> {
  const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { uid: snap.docs[0].id, ...snap.docs[0].data() } as PortalUser;
}

// ==========================================
// OTP
// ==========================================
export async function saveOTP(email: string, hashedCode: string, expiresAt: Date): Promise<void> {
  await setDoc(doc(db, 'otp_codes', email), {
    code: hashedCode,
    expires_at: Timestamp.fromDate(expiresAt),
    attempts: 0,
  });
}

export async function getOTP(email: string): Promise<{ code: string; expires_at: Timestamp; attempts: number } | null> {
  const snap = await getDoc(doc(db, 'otp_codes', email));
  if (!snap.exists()) return null;
  return snap.data() as { code: string; expires_at: Timestamp; attempts: number };
}

export async function incrementOTPAttempts(email: string): Promise<void> {
  const otpRef = doc(db, 'otp_codes', email);
  const snap = await getDoc(otpRef);
  if (snap.exists()) {
    await updateDoc(otpRef, { attempts: (snap.data().attempts || 0) + 1 });
  }
}

export async function deleteOTP(email: string): Promise<void> {
  await deleteDoc(doc(db, 'otp_codes', email));
}
