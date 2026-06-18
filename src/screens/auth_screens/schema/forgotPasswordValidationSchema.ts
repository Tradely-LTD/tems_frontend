import * as yup from 'yup';
export const forgotPasswordValidationSchema = yup.object({
  email: yup.string().email('Enter a valid email address').required('Email is required'),
});
