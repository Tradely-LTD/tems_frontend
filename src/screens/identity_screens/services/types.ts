export type KycStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export type DocumentIdType =
  | 'national_id'
  | 'drivers_licence'
  | 'voters_card'
  | 'passport';

export interface KycDocument {
  id: string;
  id_type: DocumentIdType;
  is_primary: boolean;
  uploaded_at: string;
}

export interface IdentityProfile {
  id: string;
  user_id: string;
  org_id: string;
  nin?: string | null;
  tin?: string | null;
  bvn?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  tems_id?: string | null;
  kyc_status: KycStatus;
  nin_verified: boolean;
  tin_verified: boolean;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycStatusResponse {
  success: boolean;
  data: {
    kyc_status: KycStatus;
    nin_verified: boolean;
    tin_verified: boolean;
    tems_id: string | null;
    documents: KycDocument[];
  };
}

export interface IdentityProfileResponse {
  success: boolean;
  data: IdentityProfile;
}

export interface SubmitProfileRequest {
  nin?: string;
  tin?: string;
  bvn?: string;
  date_of_birth?: string;
  address?: string;
}

export interface SubmitDocumentRequest {
  id_type: DocumentIdType;
  document_url?: string;
  selfie_url?: string;
}

export interface SubmitDocumentResponse {
  success: boolean;
  data: KycDocument;
}

// ─── Admin Review Types ──────────────────────────────────────────────────────

export interface AdminKycSubmission {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  kyc_status: KycStatus;
  nin: string | null;
  tin: string | null;
  bvn: string | null;
  date_of_birth: string | null;
  address: string | null;
  tems_id: string | null;
  nin_verified: boolean;
  tin_verified: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  primary_document: {
    id: string;
    id_type: DocumentIdType;
    document_url: string;
    selfie_url: string | null;
    uploaded_at: string;
  } | null;
  all_documents: {
    id: string;
    id_type: DocumentIdType;
    document_url: string;
    selfie_url: string | null;
    is_primary: boolean;
    uploaded_at: string;
  }[];
}

export interface SubmissionsResponse {
  success: boolean;
  data: {
    submissions: AdminKycSubmission[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ReviewRequest {
  decision: 'verified' | 'rejected';
  nin_verified?: boolean;
  tin_verified?: boolean;
}

export interface ReviewResponse {
  success: boolean;
  data: IdentityProfile;
}
