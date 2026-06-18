import * as yup from 'yup';
export const otpValidationSchema = yup.object({
  otp: yup.string()
    .length(6, 'Code must be exactly 6 digits')
    .matches(/^\d{6}$/, 'Code must contain digits only')
    .required('Verification code is required'),
});
