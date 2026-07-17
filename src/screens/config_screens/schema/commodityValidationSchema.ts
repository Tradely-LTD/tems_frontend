import * as yup from 'yup';

export const commodityCreateSchema = yup.object({
  code: yup
    .string()
    .trim()
    .max(20, 'Code cannot exceed 20 characters')
    .required('Code is required'),
  name: yup
    .string()
    .trim()
    .max(255, 'Name cannot exceed 255 characters')
    .required('Name is required'),
  category: yup
    .string()
    .trim()
    .max(100, 'Category cannot exceed 100 characters')
    .required('Category is required'),
  description: yup
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});

export type CommodityCreateFormValues = yup.InferType<typeof commodityCreateSchema>;

export const commodityUpdateSchema = yup.object({
  name: yup
    .string()
    .trim()
    .max(255, 'Name cannot exceed 255 characters')
    .required('Name is required'),
  description: yup
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  is_active: yup.boolean().required(),
});

export type CommodityUpdateFormValues = yup.InferType<typeof commodityUpdateSchema>;
