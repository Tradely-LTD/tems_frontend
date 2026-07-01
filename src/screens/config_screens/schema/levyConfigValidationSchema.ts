import * as yup from 'yup';

export const levyConfigSchema = yup.object({
  levy_mode: yup
    .mixed<'flat' | 'per_category'>()
    .oneOf(['flat', 'per_category'], 'Must be "flat" or "per_category"')
    .required('Levy mode is required'),
  flat_levy_amount: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Amount cannot be negative')
    .required('Flat levy amount is required'),
  commission_type: yup
    .mixed<'flat' | 'percentage'>()
    .oneOf(['flat', 'percentage'], 'Must be "flat" or "percentage"')
    .required('Commission type is required'),
  commission_flat_amount: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Amount cannot be negative')
    .required('Commission flat amount is required'),
  commission_percentage: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100')
    .required('Commission percentage is required'),
});

export type LevyConfigFormValues = yup.InferType<typeof levyConfigSchema>;
