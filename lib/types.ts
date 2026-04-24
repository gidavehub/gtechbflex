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

export type ProgramType = 'mentorship' | 'investment_readiness' | 'business_linkage' | 'incubation' | 'acceleration';

export interface Application {
  id: string;
  program_type: ProgramType;
  program_id?: string;
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

// Program types that are business-linked (always show full business section + business questions)
export const BUSINESS_PROGRAM_TYPES: ProgramType[] = ['business_linkage', 'incubation', 'acceleration'];

// Program types where we ask "Do you own a business?" to gate the business section
export const BUSINESS_GATE_PROGRAM_TYPES: ProgramType[] = ['mentorship'];

export const REVENUE_MODELS = [
  'Product Sales',
  'Service-based',
  'Subscription',
  'Advertising',
  'Freemium',
  'Commission / Marketplace',
  'Grants / Donations',
  'Mixed / Hybrid',
  'Other',
] as const;

export const ANNUAL_REVENUE_RANGES = [
  'No revenue yet',
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000+',
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

export const EDUCATION_LEVELS = [
  'Secondary',
  'University',
  'Vocational Training',
  'Arabic',
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

// Returns Gambia regions when Gambia is selected, empty otherwise
export function getRegionsForCountry(country: string): string[] {
  return country === 'Gambia' ? [...GAMBIA_REGIONS] : [];
}

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
  // ── Personal Information (always shown)
  { id: 'section_personal', type: 'heading', label: 'Personal Information' },
  { id: 'full_name', type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true, width: 'full' },
  { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, width: 'half' },
  { id: 'phone', type: 'phone', label: 'Phone Number', placeholder: '+220 ...', required: false, width: 'half' },
  { id: 'gender', type: 'select', label: 'Gender', options: ['Male', 'Female', 'Other'], required: true, width: 'half' },
  { id: 'education_level', type: 'select', label: 'Level of Education', options: [...EDUCATION_LEVELS], required: true, width: 'half' },
  { id: 'country', type: 'select', label: 'Country', options: [...COUNTRIES], required: true, width: 'half' },
  { id: 'region', type: 'select', label: 'Region', options: [], placeholder: 'Select your country first', required: true, width: 'half' },

  // ── Business Gate (only for mentorship — asks if applicant owns a business)
  { id: 'section_business_gate', type: 'heading', label: 'Business Ownership' },
  { id: 'has_business', type: 'radio', label: 'Do you own a business?', options: ['Yes', 'No'], required: true, width: 'full' },

  // ── Business Information (always shown for business-linked programs; gated behind has_business=Yes for mentorship)
  { id: 'section_business', type: 'heading', label: 'Business Information' },
  { id: 'business_name', type: 'text', label: 'Business Name', placeholder: 'Your business or startup name', required: true, width: 'full' },
  { id: 'business_sector', type: 'select', label: 'Business Sector', options: [...BUSINESS_SECTORS], required: true, width: 'half' },
  { id: 'formalization', type: 'radio', label: 'Formalization Status', options: ['Formal', 'Informal'], required: true, width: 'half' },

  // ── Business Questions (only for business_linkage, incubation, acceleration)
  { id: 'section_business_questions', type: 'heading', label: 'Business Details' },
  { id: 'revenue_model', type: 'select', label: 'What is your revenue model?', options: ['Product Sales', 'Service-based', 'Subscription', 'Advertising', 'Freemium', 'Commission / Marketplace', 'Grants / Donations', 'Mixed / Hybrid', 'Other'], required: true, width: 'full' },
  { id: 'annual_revenue', type: 'select', label: 'What is your average annual revenue for the past year?', options: ['No revenue yet', 'Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $50,000', '$50,000 - $100,000', '$100,000+'], required: true, width: 'full' },
  { id: 'has_raised_funds', type: 'radio', label: 'Have you raised funds?', options: ['Yes', 'No'], required: true, width: 'half' },
  { id: 'wants_to_raise_funds', type: 'radio', label: 'Do you want to raise funds?', options: ['Yes', 'No'], required: true, width: 'half' },

  // ── Motivation (always shown)
  { id: 'section_motivation', type: 'heading', label: 'Motivation' },
  { id: 'description', type: 'textarea', label: 'Why do you want to join this program?', placeholder: 'Describe your motivation and what you hope to gain...', required: true, validation: { maxLength: 1500 } },
];

/**
 * Get the visible form fields for a given program type.
 * Handles conditional sections:
 * - Business Gate (has_business?) only for BUSINESS_GATE_PROGRAM_TYPES (mentorship)
 * - Business Information shown always for BUSINESS_PROGRAM_TYPES, or conditionally for mentorship if has_business=Yes
 * - Business Questions (revenue model, etc.) only for BUSINESS_PROGRAM_TYPES
 * - Personal & Motivation always shown
 */
export function getVisibleFormFields(
  programType: ProgramType,
  answers: Record<string, any>
): FormField[] {
  const isBusinessProgram = BUSINESS_PROGRAM_TYPES.includes(programType);
  const isGateProgram = BUSINESS_GATE_PROGRAM_TYPES.includes(programType);
  const hasBusiness = answers.has_business === 'Yes';
  const selectedCountry = answers.country || '';
  const countryRegions = getRegionsForCountry(selectedCountry);

  return DEFAULT_FORM_FIELDS.filter(field => {
    // Region field: only show if a country with regions is selected
    if (field.id === 'region') {
      return selectedCountry && selectedCountry !== 'Other' && countryRegions.length > 0;
    }

    // Business gate section: only show for gate programs (mentorship)
    if (field.id === 'section_business_gate' || field.id === 'has_business') {
      return isGateProgram;
    }

    // Business information section
    if (['section_business', 'business_name', 'business_sector', 'formalization'].includes(field.id)) {
      if (isBusinessProgram) return true;       // Always show for business-linked
      if (isGateProgram) return hasBusiness;     // Show only if they have a business
      return false;                              // Hide for investment_readiness etc.
    }

    // Business questions section (revenue model, annual revenue, funds)
    if (['section_business_questions', 'revenue_model', 'annual_revenue', 'has_raised_funds', 'wants_to_raise_funds'].includes(field.id)) {
      return isBusinessProgram; // Only for business_linkage, incubation, acceleration
    }

    // Everything else (personal info, motivation) is always shown
    return true;
  }).map(field => {
    // Dynamically set region options based on selected country
    if (field.id === 'region' && countryRegions.length > 0) {
      return { ...field, options: countryRegions, placeholder: `Select region in ${selectedCountry}` };
    }
    return field;
  });
}
