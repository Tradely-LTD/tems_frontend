import * as yup from 'yup';
export const resetPasswordValidationSchema = yup.object({
  password: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirm_password: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});
