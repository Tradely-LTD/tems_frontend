export interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role_name: string;
  email_verified: boolean;
  phone_verified: boolean;
  status: string;
  org_id: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse { success: true; data: ProfileData; }
export interface UpdateProfileRequest { full_name: string; }

export interface ChangePasswordRequest { current_password: string; new_password: string; }

export interface InitiateEmailChangeRequest { new_email: string; }
export interface ConfirmEmailChangeRequest { otp: string; }

export interface UserSettingsData {
  notifications_enabled: boolean;
  email_notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  scan_sound_enabled?: boolean;
  offline_mode_hint?: boolean;
  digest_frequency?: 'daily' | 'weekly' | 'none';
}
export interface UserSettingsResponse { success: true; data: UserSettingsData; }
export interface UpdateSettingsRequest extends Partial<UserSettingsData> {}
export interface MessageResponse { success: true; data: { message: string }; }
