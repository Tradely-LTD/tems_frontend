import * as yup from 'yup';

export const step1Schema = yup.object({
  commodity_code: yup.string().required('Commodity code is required'),
  shipper_tems_id: yup.string().optional(),
  shipper_tin: yup.string().optional(),
  consignee_name: yup.string().optional(),
  consignee_phone: yup.string().optional(),
  consignee_tin: yup.string().optional(),
  commodity_description: yup.string().optional(),
});

export type Step1FormValues = yup.InferType<typeof step1Schema>;
