import * as yup from 'yup';

export const RULE_SCOPES = ['global', 'state', 'lga', 'market'] as const;
export const RULE_BASES = ['flat', 'per_kg', 'per_tonne', 'ad_valorem'] as const;
export const RULE_STATUSES = ['active', 'scheduled', 'superseded', 'inactive'] as const;

export interface RuleFormValues {
  authority_id: string;
  scope: (typeof RULE_SCOPES)[number];
  state_name: string;
  lga_name: string;
  market_id: string;
  commodity_code: string;
  basis: (typeof RULE_BASES)[number];
  rate: number;
  effective_from: string;
  effective_to: string;
  notes: string;
  status: (typeof RULE_STATUSES)[number];
}

export const DEFAULT_RULE_FORM: RuleFormValues = {
  authority_id: '',
  scope: 'global',
  state_name: '',
  lga_name: '',
  market_id: '',
  commodity_code: '',
  basis: 'flat',
  rate: 0,
  effective_from: '',
  effective_to: '',
  notes: '',
  status: 'active',
};

/**
 * Mirrors the server-side validation in revenue-rules/route.ts and service.ts:
 *  - state_name required for scope in {state, lga, market}
 *  - lga_name required for scope in {lga, market}
 *  - market_id required for scope === market
 * The server remains the source of truth; this is purely for UX.
 */
export const ruleValidationSchema = yup.object({
  authority_id: yup.string().required('Authority is required'),
  scope: yup.string().oneOf(RULE_SCOPES).required('Scope is required'),
  state_name: yup.string().when('scope', {
    is: (scope: string) => ['state', 'lga', 'market'].includes(scope),
    then: (schema) => schema.trim().required('State is required for this scope'),
    otherwise: (schema) => schema.trim(),
  }),
  lga_name: yup.string().when('scope', {
    is: (scope: string) => ['lga', 'market'].includes(scope),
    then: (schema) => schema.trim().required('LGA is required for this scope'),
    otherwise: (schema) => schema.trim(),
  }),
  market_id: yup.string().when('scope', {
    is: 'market',
    then: (schema) => schema.trim().required('Market is required for market scope'),
    otherwise: (schema) => schema.trim(),
  }),
  commodity_code: yup.string().trim(),
  basis: yup.string().oneOf(RULE_BASES).required('Basis is required'),
  rate: yup.number().positive('Rate must be positive').required('Rate is required'),
  effective_from: yup.string().required('Effective-from date is required'),
  effective_to: yup.string(),
  notes: yup.string(),
  status: yup.string().oneOf(RULE_STATUSES),
});

export interface PreviewFormValues {
  commodity_code: string;
  state_name: string;
  lga_name: string;
  market_id: string;
  quantity: number;
  unit: 'kg' | 'tonnes' | 'bags' | 'units' | 'litres' | 'crates';
  declared_value: number;
}

export const DEFAULT_PREVIEW_FORM: PreviewFormValues = {
  commodity_code: '',
  state_name: '',
  lga_name: '',
  market_id: '',
  quantity: 0,
  unit: 'kg',
  declared_value: 0,
};

export const previewValidationSchema = yup.object({
  commodity_code: yup.string().trim().required('Commodity code is required'),
  state_name: yup.string().trim().required('State is required'),
  lga_name: yup.string().trim(),
  market_id: yup.string().trim(),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  unit: yup.string().oneOf(['kg', 'tonnes', 'bags', 'units', 'litres', 'crates']).required(),
  declared_value: yup.number().min(0, 'Cannot be negative'),
});
