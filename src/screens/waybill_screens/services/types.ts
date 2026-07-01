export interface WaybillProduct {
  id: string;
  waybill_id: string;
  commodity_code: string;
  description: string;
  quantity: string;
  unit: string;
  weight_kg: string;
  declared_unit_value: string;
  declared_total_value: string;
  created_at: string;
}

export interface LevyLine {
  authority_name: string;
  basis?: string;
  rate?: number;
  amount: number;
}

export interface Waybill {
  waybill_id: string;
  org_id: string;
  created_by: string;
  shipper_tems_id?: string;
  shipper_tin?: string;
  consignee_name?: string;
  consignee_phone?: string;
  consignee_tin?: string;
  driver_nin_hash?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_reg: string;
  origin_state: string;
  origin_lga: string;
  origin_market?: string;
  destination_state: string;
  destination_lga: string;
  destination_market?: string;
  departure_date: string;
  departure_time?: string;
  estimated_arrival?: string;
  commodity_code: string;
  total_declared_value: string;
  levy_total: string;
  levy_breakdown: LevyLine[];
  data_fee: string;
  escrow_enabled: boolean;
  escrow_amount?: string;
  payment_status: string;
  shipment_status: string;
  incident_status: string;
  qr_payload?: string;
  channel: string;
  expires_at: string;
  first_scanned_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  dispute_reason?: string;
  disputed_at?: string;
  blockchain_hash?: string;
  deleted_at?: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
  products?: WaybillProduct[];
}

export interface WaybillListResponse {
  success: boolean;
  data: {
    data: Waybill[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface WaybillDetailResponse {
  success: boolean;
  data: Waybill;
}

export interface WaybillListParams {
  page?: number;
  limit?: number;
  shipment_status?: string;
  payment_status?: string;
  search?: string;
}

export interface CreateWaybillRequest {
  shipper_tems_id?: string;
  shipper_tin?: string;
  consignee_name?: string;
  consignee_phone?: string;
  consignee_tin?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_reg: string;
  origin_state: string;
  origin_lga: string;
  origin_market?: string;
  destination_state: string;
  destination_lga: string;
  destination_market?: string;
  departure_date: string;
  departure_time?: string;
  commodity_code: string;
  total_declared_value: number;
  levy_total: number;
  levy_breakdown?: LevyLine[];
  escrow_enabled?: boolean;
  escrow_amount?: number;
  channel?: string;
  products: {
    commodity_code: string;
    description: string;
    quantity: number;
    unit: string;
    weight_kg: number;
    declared_unit_value: number;
    declared_total_value: number;
  }[];
}

export interface CreateWaybillResponse {
  success: boolean;
  data: Waybill;
}

export interface CancelDisputeRequest {
  id: string;
  reason?: string;
}

export interface CancelDisputeResponse {
  success: boolean;
  data: {
    waybill_id: string;
    shipment_status: string;
    cancelled_at?: string;
    cancel_reason?: string;
    disputed_at?: string;
    dispute_reason?: string;
  };
}

export interface LevyCalculateRequest {
  commodity_code: string;
  quantity: number;
  unit: string;
  declared_value?: number;
}

export interface LevyCalculateResponse {
  success: boolean;
  data: {
    commodity_code: string;
    quantity: number;
    unit: string;
    levy_lines: LevyLine[];
    levy_subtotal: number;
    data_fee: number;
    total: number;
  };
}

export interface InitiatePaymentRequest {
  waybill_id: string;
  gateway_id?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  data: {
    transaction_id: string;
    payment_reference: string;
    authorization_url: string;
    amount: number;
    currency: string;
  };
}

// Wizard form data held in React context
export interface WizardStep1Data {
  shipper_tems_id: string;
  shipper_tin: string;
  consignee_name: string;
  consignee_phone: string;
  consignee_tin: string;
  commodity_code: string;
  commodity_description: string;
}

export interface WizardStep2Product {
  description: string;
  commodity_code: string;
  quantity: number;
  unit: string;
  weight_kg: number;
  declared_unit_value: number;
  declared_total_value: number;
}

export interface WizardStep2Data {
  products: WizardStep2Product[];
}

export interface WizardStep3Data {
  origin_state: string;
  origin_lga: string;
  origin_market: string;
  destination_state: string;
  destination_lga: string;
  destination_market: string;
  departure_date: string;
  departure_time: string;
  vehicle_reg: string;
  driver_name: string;
  driver_phone: string;
}

export interface WizardFormData {
  step1: WizardStep1Data;
  step2: WizardStep2Data;
  step3: WizardStep3Data;
}
