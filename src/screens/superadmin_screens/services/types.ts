export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface PlatformUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: UserStatus;
  org_id: string;
  org_name?: string;
  org_type?: string;
  role_id: string;
  role_name?: string;
  role_display?: string;
  role_permissions?: string[];
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at?: string;
  created_at: string;
  state_name?: string;
  permission_overrides?: string[];
}

export interface UserListResponse {
  success: boolean;
  data: PlatformUser[];
  meta?: { page: number; limit: number; total: number };
}

export interface UserDetailResponse {
  success: boolean;
  data: PlatformUser;
}

export interface CreatePlatformUserInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role_name: string;
  org_name: string;
  org_type?: string;
}

export interface UpdatePlatformUserInput {
  full_name?: string;
  status?: UserStatus;
  role_id?: string;
}

export interface UpdatePermissionsInput {
  overrides: string[];
}

export interface UpdatePermissionsResponse {
  success: boolean;
  data: { id: string; permission_overrides: string[] };
}

export type TransferStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface SettlementSplit {
  authority: string;
  tier: string;
  percentage: number;
  amount: number;
}

export interface Settlement {
  id: string;
  org_id: string;
  authority_id: string;
  settlement_date: string;
  waybill_count: number;
  total_collected: string;
  total_disbursed: string;
  transfer_reference?: string;
  transfer_status: TransferStatus;
  disbursed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementBatchSummary {
  settlement_date: string;
  org_id: string;
  waybill_count: number;
  total_collected: number;
  splits: SettlementSplit[];
  settlement_ids: string[];
}

export interface SettlementListResponse {
  success: boolean;
  data: Settlement[] | { data: Settlement[]; page: number; limit: number; total: number };
}

export interface SettlementDetailResponse {
  success: boolean;
  data: Settlement;
}

export interface RunSettlementInput {
  date: string;
}

export interface RunSettlementResponse {
  success: boolean;
  data: SettlementBatchSummary;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  org_type: string;
  is_master: boolean;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  registration_number?: string;
  org_category?: string;
  state_id?: string;
  metadata?: { enabled_modules?: string[] } | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateOrgInput {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
  enabled_modules?: string[];
}

export interface CreateOrgInput {
  name: string;
  org_type: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
}

export interface OrgListResponse {
  success: boolean;
  data: Org[];
  meta?: { page: number; limit: number; total: number };
}

export interface OrgDetailResponse {
  success: boolean;
  data: Org;
}

// ─── Revenue Disbursement Module ───────────────────────────────────────────────

export type AuthorityTier = 'federal' | 'state' | 'lga' | 'tradely' | 'agent';
export type StakeholderType = 'platform' | 'federal' | 'state' | 'lga' | 'market' | 'jrb' | 'agent';
export type SettlementType = 'bank_transfer' | 'wallet' | 'manual';
export type RuleScope = 'global' | 'state' | 'lga' | 'market';
export type RuleBasis = 'flat' | 'per_kg' | 'per_tonne' | 'ad_valorem';
export type RuleStatus = 'active' | 'scheduled' | 'superseded' | 'inactive';
export type DisbStatus = 'pending' | 'processing' | 'disbursed' | 'failed' | 'cancelled';
export type ContactRole = 'primary' | 'backup';
export type PreviewUnit = 'kg' | 'tonnes' | 'bags' | 'units' | 'litres' | 'crates';

export interface RevenueAuthority {
  id: string;
  authority_code: string;
  authority_name: string;
  tier: AuthorityTier;
  state?: string | null;
  lga?: string | null;
  bank_name?: string | null;
  bank_code?: string | null;
  // @deprecated use paystack_recipient_code
  paystack_subaccount_code?: string | null;
  is_active: boolean;
  jrb_verified: boolean;
  stakeholder_type: StakeholderType;
  settlement_type: SettlementType;
  nibss_verified: boolean;
  nibss_verified_at?: string | null;
  nibss_account_name?: string | null;
  compliance_doc_url?: string | null;
  paystack_recipient_code?: string | null;
  moniepoint_subaccount_code?: string | null;
  account_last4: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAuthorityInput {
  authority_code: string;
  authority_name: string;
  tier: AuthorityTier;
  stakeholder_type: StakeholderType;
  settlement_type?: SettlementType;
  state?: string;
  lga?: string;
  bank_name?: string;
  bank_code?: string;
  account_number?: string;
}

export interface UpdateAuthorityInput {
  authority_name?: string;
  tier?: AuthorityTier;
  stakeholder_type?: StakeholderType;
  settlement_type?: SettlementType;
  state?: string;
  lga?: string;
  bank_name?: string;
  bank_code?: string;
  account_number?: string;
  paystack_recipient_code?: string;
  moniepoint_subaccount_code?: string;
  is_active?: boolean;
}

export interface AuthorityListResponse {
  success: boolean;
  data: { data: RevenueAuthority[]; total: number; page: number; limit: number };
}

export interface AuthorityDetailResponse {
  success: boolean;
  data: RevenueAuthority;
}

export interface AuthorityAdminContact {
  id: string;
  authority_id: string;
  user_id: string;
  role: ContactRole;
  created_at: string;
}

export interface AddContactInput {
  authorityId: string;
  userId: string;
  role: ContactRole;
}

export interface RevenueRule {
  id: string;
  authority_id: string;
  scope: RuleScope;
  state_name?: string | null;
  lga_name?: string | null;
  market_id?: string | null;
  commodity_code?: string | null;
  basis: RuleBasis;
  // Decimal columns come back from the DB as strings (Drizzle default serialization)
  rate: string | number;
  effective_from: string;
  effective_to?: string | null;
  status: RuleStatus;
  notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRuleInput {
  authority_id: string;
  scope: RuleScope;
  state_name?: string;
  lga_name?: string;
  market_id?: string;
  commodity_code?: string;
  basis: RuleBasis;
  rate: number;
  effective_from: string;
  effective_to?: string;
  notes?: string;
}

export interface UpdateRuleInput {
  rate?: number;
  effective_from?: string;
  effective_to?: string;
  status?: RuleStatus;
  notes?: string;
}

export interface RuleListParams {
  authority_id?: string;
  scope?: RuleScope;
  status?: RuleStatus;
  page?: number;
  limit?: number;
}

export interface RuleListResponse {
  success: boolean;
  data: { data: RevenueRule[]; total: number; page: number; limit: number };
}

export interface RuleDetailResponse {
  success: boolean;
  data: RevenueRule;
}

/**
 * Preview-only levy line shape. NOTE: in the /rules/preview response, `rate`
 * and `amount` are plain JS numbers (computed in-memory). This differs from
 * persisted levy line rows where decimal columns are serialized as strings.
 */
export interface PreviewLevyLine {
  authority_id: string;
  authority_code: string;
  authority_name: string;
  basis: RuleBasis;
  rate: number;
  amount: number;
}

export interface PreviewRulesInput {
  commodity_code: string;
  state_name: string;
  lga_name?: string;
  market_id?: string;
  quantity: number;
  unit: PreviewUnit;
  declared_value?: number;
}

export interface PreviewRulesResult {
  levy_lines: PreviewLevyLine[];
  data_fee: number;
  total: number;
}

export interface PreviewRulesResponse {
  success: boolean;
  data: PreviewRulesResult;
}

export interface WaybillLevyLine {
  id: string;
  waybill_id: string;
  authority_id: string;
  authority_code: string;
  authority_name: string;
  basis: RuleBasis;
  // Persisted decimal columns — strings from the DB
  rate: string;
  amount: string;
  disb_status: DisbStatus;
  settlement_id?: string | null;
  disbursed_at?: string | null;
  created_at: string;
}

export interface LevyLineListParams {
  disb_status?: DisbStatus;
  authority_id?: string;
  page?: number;
  limit?: number;
}

export interface LevyLineListResponse {
  success: boolean;
  data: { data: WaybillLevyLine[]; total: number; page: number; limit: number };
}

export interface WaybillLevyLinesResponse {
  success: boolean;
  data: WaybillLevyLine[];
}
