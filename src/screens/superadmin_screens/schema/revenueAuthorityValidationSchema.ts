import * as yup from 'yup';

export const AUTHORITY_TIERS = ['federal', 'state', 'lga', 'tradely', 'agent'] as const;
export const STAKEHOLDER_TYPES = ['platform', 'federal', 'state', 'lga', 'market', 'jrb', 'agent'] as const;
export const SETTLEMENT_TYPES = ['bank_transfer', 'wallet', 'manual'] as const;

export interface AuthorityFormValues {
  authority_code: string;
  authority_name: string;
  tier: (typeof AUTHORITY_TIERS)[number];
  stakeholder_type: (typeof STAKEHOLDER_TYPES)[number];
  settlement_type: (typeof SETTLEMENT_TYPES)[number];
  state: string;
  lga: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
}

export const authorityValidationSchema = yup.object({
  authority_code: yup.string().trim().max(50, 'Max 50 characters').required('Authority code is required'),
  authority_name: yup.string().trim().max(255, 'Max 255 characters').required('Authority name is required'),
  tier: yup.string().oneOf(AUTHORITY_TIERS).required('Tier is required'),
  stakeholder_type: yup.string().oneOf(STAKEHOLDER_TYPES).required('Stakeholder type is required'),
  settlement_type: yup.string().oneOf(SETTLEMENT_TYPES).required(),
  state: yup.string().trim().max(100, 'Max 100 characters'),
  lga: yup.string().trim().max(100, 'Max 100 characters'),
  bank_name: yup.string().trim().max(100, 'Max 100 characters'),
  bank_code: yup.string().trim().max(10, 'Max 10 characters'),
  account_number: yup
    .string()
    .trim()
    .test('len', 'Account number must be exactly 10 digits', (v) => !v || v.length === 10)
    .test('digits', 'Account number must contain only digits', (v) => !v || /^\d+$/.test(v)),
});

export const DEFAULT_AUTHORITY_FORM: AuthorityFormValues = {
  authority_code: '',
  authority_name: '',
  tier: 'lga',
  stakeholder_type: 'lga',
  settlement_type: 'bank_transfer',
  state: '',
  lga: '',
  bank_name: '',
  bank_code: '',
  account_number: '',
};

export interface ContactFormValues {
  userId: string;
  role: 'primary' | 'backup';
}

export const contactValidationSchema = yup.object({
  userId: yup.string().trim().required('User ID is required'),
  role: yup.string().oneOf(['primary', 'backup']).required(),
});
