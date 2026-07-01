import * as yup from 'yup';

export const orgDetailsSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Organisation name must be at least 2 characters')
    .required('Organisation name is required'),
  registration_number: yup
    .string()
    .min(2, 'Registration number is required')
    .required('Registration number is required'),
  state_id: yup.string().required('State is required'),
  lga_id: yup.string().required('LGA is required'),
  state_name: yup.string().optional(),
  lga_name: yup.string().optional(),
  contact_email: yup
    .string()
    .email('Enter a valid email')
    .required('Contact email is required'),
  contact_phone: yup
    .string()
    .min(10, 'Enter a valid phone number')
    .required('Contact phone is required'),
});

export const adminDetailsSchema = yup.object({
  full_name: yup
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup
    .string()
    .min(10, 'Enter a valid phone number')
    .required('Phone is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export type OrgFormValues = yup.InferType<typeof orgDetailsSchema>;
export type AdminFormValues = yup.InferType<typeof adminDetailsSchema>;
