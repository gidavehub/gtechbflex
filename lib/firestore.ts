import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, Timestamp, setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { Program, Application, PortalUser, ProgramType } from './types';

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

/**
 * Check if an application already exists for a given email + program type combo.
 * Prevents duplicate submissions without requiring user accounts.
 */
export async function checkExistingApplicationByEmail(programType: string, email: string): Promise<boolean> {
  const q = query(
    collection(db, 'applications'),
    where('program_type', '==', programType)
  );
  const snap = await getDocs(q);
  // Check in answers.email or legacy email field
  const active = snap.docs.filter(d => {
    const data = d.data();
    const status = data.status;
    if (status === 'withdrawn' || status === 'rejected') return false;
    const appEmail = data.answers?.email || data.email || '';
    return appEmail.toLowerCase() === email.toLowerCase();
  });
  return active.length > 0;
}

/**
 * Get applications filtered by program type.
 */
export async function getApplicationsByType(programType: ProgramType): Promise<Application[]> {
  const q = query(
    collection(db, 'applications'),
    where('program_type', '==', programType),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
}

// ==========================================
// ADMIN USERS (kept for admin auth)
// ==========================================
export async function getUser(uid: string): Promise<PortalUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as PortalUser;
}

export async function getUserByEmail(email: string): Promise<PortalUser | null> {
  const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { uid: snap.docs[0].id, ...snap.docs[0].data() } as PortalUser;
}
