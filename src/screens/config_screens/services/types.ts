export type LevyMode = 'flat' | 'per_category';
export type CommissionType = 'flat' | 'percentage';

export interface LevyConfig {
  id: string | null;
  levy_mode: LevyMode;
  flat_levy_amount: number;
  commission_type: CommissionType;
  commission_flat_amount: number;
  commission_percentage: number;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface LevyConfigInput {
  levy_mode: LevyMode;
  flat_levy_amount: number;
  commission_type: CommissionType;
  commission_flat_amount: number;
  commission_percentage: number;
}

export interface Commodity {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCommodityInput {
  code: string;
  name: string;
  category: string;
  description?: string;
}

export interface UpdateCommodityInput {
  name?: string;
  description?: string;
  is_active?: boolean;
}
