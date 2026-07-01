export interface AgentMarket {
  id: string;
  name: string;
  code: string;
  market_type: string | null;
}

export interface AgentIdentity {
  tems_id: string | null;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
}

export interface AgentRecord {
  id: string;
  user_id: string;
  org_id: string;
  tier: number;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  phone: string | null;
  address: string | null;
  state: string | null;
  lga: string | null;
  dob: string | null;
  bank_name: string | null;
  bank_code: string | null;
  market_id: string | null;
  float_balance: string;
  is_active: boolean;
  device_imei: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentProfile extends AgentRecord {
  bank_account: string | null;
  email: string | null;
  market: AgentMarket | null;
  identity: AgentIdentity | null;
}

export interface AgentListParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
  market_id?: string;
  org_id?: string;
}

export interface AgentListResponse {
  success: boolean;
  data: AgentRecord[];
  meta: { page: number; limit: number; total: number };
}

export interface AgentProfileResponse {
  success: boolean;
  data: AgentProfile;
}

export interface RegisterAgentRequest {
  user_id: string;
  tier?: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone: string;
  address?: string;
  state?: string;
  lga?: string;
  dob?: string;
  bank_account: string;
  bank_name: string;
  bank_code: string;
  market_id?: string | null;
  device_imei?: string;
}

export type RegisterAgentResponse = AgentProfileResponse;

export interface MarketOption {
  id: string;
  name: string;
  code: string;
  lga_id: string;
  market_type: string | null;
  is_active: boolean;
}

export interface InviteAgentRequest {
  email: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  address?: string;
  state?: string;
  lga?: string;
  dob?: string;
  bank_account: string;
  bank_name: string;
  bank_code: string;
  tier?: number;
  market_id?: string | null;
  device_imei?: string;
}

export type InviteAgentResponse = AgentProfileResponse;

export interface PatchAgentRequest {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string;
  address?: string;
  state?: string;
  lga?: string;
  dob?: string;
  bank_account?: string;
  bank_name?: string;
  bank_code?: string;
  market_id?: string | null;
  device_imei?: string;
  is_active?: boolean;
  tier?: number;
}
