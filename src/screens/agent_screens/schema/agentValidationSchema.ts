import * as yup from 'yup';
import type { InferType } from 'yup';

export const agentOnboardingSchema = yup.object({
  // Account credentials
  email:        yup.string().email('Enter a valid email address').required('Email is required'),
  phone:        yup.string().min(7, 'Enter a valid phone number').required('Phone number is required'),
  password:     yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),

  // Personal details
  first_name:   yup.string().required('First name is required'),
  last_name:    yup.string().required('Last name (surname) is required'),
  middle_name:  yup.string().optional(),
  address:      yup.string().optional(),
  state:        yup.string().optional(),
  lga:          yup.string().optional(),
  dob:          yup.string().optional(),

  // Banking
  bank_account: yup.string()
    .required('Bank account number is required')
    .matches(/^\d{10}$/, 'Must be a 10-digit NUBAN account number'),
  bank_name:    yup.string().required('Bank name is required'),
  bank_code:    yup.string().required('Bank code is required'),

  // Assignment
  tier:         yup.number().min(1).max(5).optional().default(2),
  market_id:    yup.string().nullable().optional(),
  device_imei:  yup.string().optional(),
});

export type AgentOnboardingFormValues = InferType<typeof agentOnboardingSchema>;
