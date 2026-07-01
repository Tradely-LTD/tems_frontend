export type IncidentType =
  | 'suspicious_cargo'
  | 'route_deviation'
  | 'overloading'
  | 'document_missing'
  | 'illegal_demand'
  | 'other';

export type IncidentState = 'open' | 'investigating' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  waybill_id: string;
  org_id: string;
  reported_by: string;
  incident_type: IncidentType;
  state: IncidentState;
  description?: string;
  evidence_urls?: string[];
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentInput {
  waybill_id: string;
  incident_type: IncidentType;
  description?: string;
  evidence_urls?: string[];
}

export interface UpdateIncidentStateInput {
  state: IncidentState;
  notes?: string;
}

export interface IncidentListResponse {
  success: boolean;
  data: Incident[];
  meta?: { page: number; limit: number; total: number };
}

export interface IncidentDetailResponse {
  success: boolean;
  data: Incident;
}

export type ScanResult = 'valid' | 'invalid' | 'expired' | 'suspended';
export type ScanMethod  = 'qr_camera' | 'manual_entry';

export interface CheckpointScan {
  id: string;
  waybill_id: string;
  officer_id?: string;
  officer_unit?: string;
  gps_lat?: string;
  gps_lng?: string;
  location_name?: string;
  scan_result: ScanResult;
  scan_method: ScanMethod;
  incident_flagged: boolean;
  scanned_at: string;
  created_at: string;
}

export interface EnforcementScanInput {
  waybill_id: string;
  scan_method?: ScanMethod;
  gps_lat?: number;
  gps_lng?: number;
  location_name?: string;
}

export interface ScanListResponse {
  success: boolean;
  data: CheckpointScan[];
  meta?: { page: number; limit: number; total: number };
}

export interface ScanDetailResponse {
  success: boolean;
  data: CheckpointScan;
}
