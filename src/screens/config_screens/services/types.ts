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
