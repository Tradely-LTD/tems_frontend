import * as yup from 'yup';
import type { InferType } from 'yup';

export const updateProfileSchema = yup.object({
  full_name: yup.string().min(1, 'Name is required').max(255, 'Name is too long').required('Name is required'),
});

export const changePasswordSchema = yup
  .object({
    current_password: yup.string().min(1, 'Current password is required').required('Current password is required'),
    new_password: yup
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password is too long')
      .required('New password is required'),
    confirm_password: yup.string().min(1, 'Please confirm your new password').required('Please confirm your new password'),
  })
  .test('passwords-match', 'New passwords do not match', function (values) {
    const { new_password, confirm_password } = values;
    if (new_password && confirm_password && new_password !== confirm_password) {
      return this.createError({ path: 'confirm_password', message: 'New passwords do not match' });
    }
    return true;
  });

export const initiateEmailChangeSchema = yup.object({
  new_email: yup.string().email('Please enter a valid email address').required('Email is required'),
});

export const confirmEmailChangeSchema = yup.object({
  otp: yup
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .matches(/^\d{6}$/, 'OTP must be 6 numeric digits')
    .required('OTP is required'),
});

export const updateSettingsSchema = yup.object({
  notifications_enabled: yup.boolean().optional(),
  email_notifications: yup.boolean().optional(),
  theme: yup.string().oneOf(['light', 'dark', 'system']).optional(),
  scan_sound_enabled: yup.boolean().optional(),
  offline_mode_hint: yup.boolean().optional(),
  digest_frequency: yup.string().oneOf(['daily', 'weekly', 'none']).optional(),
});

export type UpdateProfileFormValues = InferType<typeof updateProfileSchema>;
export type ChangePasswordFormValues = InferType<typeof changePasswordSchema>;
export type InitiateEmailChangeFormValues = InferType<typeof initiateEmailChangeSchema>;
export type ConfirmEmailChangeFormValues = InferType<typeof confirmEmailChangeSchema>;
export type UpdateSettingsFormValues = InferType<typeof updateSettingsSchema>;
