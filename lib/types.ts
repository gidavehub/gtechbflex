import { Timestamp } from 'firebase/firestore';

// ==========================================
// FORM FIELD (Sophisticated Form Builder)
// ==========================================
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'heading'
  | 'paragraph';

export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface FormFieldCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty';
  value?: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
  validation?: FormFieldValidation;
  showIf?: FormFieldCondition;
  width?: 'full' | 'half';
  // For heading/paragraph types
  content?: string;
}

// ==========================================
// PROGRAM
// ==========================================
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
  fields: FormField[];
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
  program_id: string;
  // Dynamic form answers keyed by field ID
  answers: Record<string, any>;
  // Status
  status: ApplicationStatus;
  admin_notes?: string;
  // Legacy fixed fields (for old applications before form builder)
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  country?: string;
  region?: string;
  business_name?: string;
  business_sector?: string;
  formalization_status?: string;
  year_established?: number;
  description_of_need?: string;
  program_interests?: string[];
  portal_user_id?: string;
  metadata?: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ==========================================
// USER (Admin only now)
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

// ==========================================
// FIELD TYPE METADATA
// ==========================================
export const FIELD_TYPE_OPTIONS: { value: FormFieldType; label: string; icon: string }[] = [
  { value: 'heading', label: 'Section Heading', icon: '📌' },
  { value: 'paragraph', label: 'Instructions', icon: '📝' },
  { value: 'text', label: 'Short Text', icon: 'Aa' },
  { value: 'textarea', label: 'Long Text', icon: '📄' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'number', label: 'Number', icon: '#' },
  { value: 'select', label: 'Dropdown', icon: '▾' },
  { value: 'multiselect', label: 'Multi Select', icon: '☑️' },
  { value: 'radio', label: 'Radio Buttons', icon: '⊙' },
  { value: 'checkbox', label: 'Checkbox', icon: '✓' },
  { value: 'date', label: 'Date', icon: '📅' },
];

// ==========================================
// DEFAULT FORM TEMPLATE
// ==========================================
export const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'section_personal', type: 'heading', label: 'Personal Information' },
  { id: 'full_name', type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true, width: 'full' },
  { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, width: 'half' },
  { id: 'phone', type: 'phone', label: 'Phone Number', placeholder: '+220 ...', required: false, width: 'half' },
  { id: 'gender', type: 'select', label: 'Gender', options: ['Male', 'Female', 'Other'], required: true, width: 'half' },
  { id: 'country', type: 'select', label: 'Country', options: [...COUNTRIES], required: true, width: 'half' },
  { id: 'section_business', type: 'heading', label: 'Business Information' },
  { id: 'business_name', type: 'text', label: 'Business Name', placeholder: 'Your business or startup name', required: true, width: 'full' },
  { id: 'business_sector', type: 'select', label: 'Business Sector', options: [...BUSINESS_SECTORS], required: true, width: 'half' },
  { id: 'formalization', type: 'radio', label: 'Formalization Status', options: ['Formal', 'Informal'], required: true, width: 'half' },
  { id: 'section_motivation', type: 'heading', label: 'Motivation' },
  { id: 'description', type: 'textarea', label: 'Why do you want to join this program?', placeholder: 'Describe your motivation and what you hope to gain...', required: true, validation: { maxLength: 1500 } },
];
