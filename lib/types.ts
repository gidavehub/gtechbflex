import { Timestamp } from 'firebase/firestore';

// ==========================================
// PROGRAM
// ==========================================
export interface ProgramQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
  required?: boolean;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  program_type: 'mentorship' | 'investment_readiness' | 'business_linkage' | 'incubation' | 'acceleration';
  sector?: string;
  is_active: boolean;
  is_applications_open: boolean;
  max_participants: number;
  current_participants: number;
  questions: ProgramQuestion[];
  start_date?: string;
  end_date?: string;
  location?: string;
  image_base64?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ==========================================
// APPLICATION
// ==========================================
export type ApplicationStatus = 'under_review' | 'accepted' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  // Personal info
  full_name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  country: string;
  region: string;
  // Business info
  business_name: string;
  business_sector: string;
  formalization_status: 'Formal' | 'Informal';
  year_established: number;
  // Program info
  description_of_need: string;
  program_interests: string[];
  program_id: string;
  portal_user_id: string;
  // Status
  status: ApplicationStatus;
  assigned_program?: string;
  admin_notes?: string;
  // Dynamic answers
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ==========================================
// USER (Portal)
// ==========================================
export interface PortalUser {
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: string;
  country?: string;
  region?: string;
  role: 'user' | 'admin';
  verified: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ==========================================
// CONSTANTS
// ==========================================
export const PROGRAM_TYPES = [
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'investment_readiness', label: 'Investment Readiness' },
  { value: 'business_linkage', label: 'Business Linkage' },
  { value: 'incubation', label: 'Incubation' },
  { value: 'acceleration', label: 'Acceleration' },
] as const;

export const PROGRAM_INTERESTS = [
  'Mentorship',
  'Investment Readiness',
  'Business Linkage',
  'Incubation',
  'Acceleration',
] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const FORMALIZATION_STATUSES = ['Formal', 'Informal'] as const;

export const BUSINESS_SECTORS = [
  'Agriculture',
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Manufacturing',
  'Retail',
  'Tourism & Hospitality',
  'Construction',
  'Creative Industries',
  'Energy',
  'Transportation',
  'Telecommunications',
  'Food & Beverage',
  'Other',
] as const;

export const GAMBIA_REGIONS = [
  'Banjul',
  'Kanifing',
  'Brikama (West Coast)',
  'Mansakonko (Lower River)',
  'Kerewan (North Bank)',
  'Kuntaur (Central River North)',
  'Janjanbureh (Central River South)',
  'Basse (Upper River)',
] as const;

export const COUNTRIES = [
  'Gambia',
  'Senegal',
  'Guinea-Bissau',
  'Guinea',
  'Mali',
  'Sierra Leone',
  'Liberia',
  'Ghana',
  'Nigeria',
  'Other',
] as const;
