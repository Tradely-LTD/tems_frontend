export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  status: string;
  org_id: string;
  role_id: string;
  role_name: string;
  phone_verified: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    user: UserData;
  };
}

export interface OtpSendRequest { phone: string; }
export interface OtpVerifyRequest { phone: string; otp: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { token: string; password: string; }
export interface RefreshRequest { refresh_token: string; }
export interface MessageResponse { success: boolean; data: { message: string }; }
export interface ApiError { success: false; message: string; errors?: unknown[]; }

export interface RegisterSubconcessionaireOrgPayload {
  name: string;
  registration_number: string;
  state_id: string;
  lga_id: string;
  contact_email: string;
  contact_phone: string;
}

export interface RegisterSubconcessionaireAdminPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterSubconcessionaireRequest {
  org_category: 'private_company' | 'government_body' | 'trade_union';
  org: RegisterSubconcessionaireOrgPayload;
  admin: RegisterSubconcessionaireAdminPayload;
}

export interface RegisterSubconcessionaireResponse {
  success: boolean;
  data: { message: string; org_id: string; user_id: string };
}
