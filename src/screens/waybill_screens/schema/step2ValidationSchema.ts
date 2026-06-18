import * as yup from 'yup';

export const productSchema = yup.object({
  product_name: yup.string().required('Product name is required'),
  commodity_code: yup.string().required('Commodity code is required'),
  hs_code: yup.string().optional(),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than 0')
    .required('Quantity is required'),
  unit: yup.string().required('Unit is required'),
  weight_kg: yup
    .number()
    .typeError('Weight must be a number')
    .min(0, 'Weight cannot be negative')
    .optional(),
  declared_value: yup
    .number()
    .typeError('Declared value must be a number')
    .min(0, 'Declared value cannot be negative')
    .required('Declared value is required'),
});

export const step2Schema = yup.object({
  products: yup
    .array()
    .of(productSchema)
    .min(1, 'At least one product is required')
    .required('Products are required'),
});

export type Step2FormValues = yup.InferType<typeof step2Schema>;
export type ProductFormValues = yup.InferType<typeof productSchema>;
