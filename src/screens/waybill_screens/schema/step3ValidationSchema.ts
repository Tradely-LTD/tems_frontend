import * as yup from 'yup';

export const step3Schema = yup.object({
  origin_state: yup.string().required('Origin state is required'),
  origin_lga: yup.string().required('Origin LGA is required'),
  origin_market: yup.string().optional(),
  destination_state: yup.string().required('Destination state is required'),
  destination_lga: yup.string().required('Destination LGA is required'),
  destination_market: yup.string().optional(),
  departure_date: yup
    .string()
    .required('Departure date is required')
    .test('not-past', 'Departure date cannot be in the past', (val) => {
      if (!val) return true;
      return new Date(val) >= new Date(new Date().toDateString());
    }),
  departure_time: yup.string().optional(),
  vehicle_reg: yup.string().required('Vehicle registration is required'),
  driver_name: yup.string().optional(),
  driver_phone: yup.string().optional(),
});

export type Step3FormValues = yup.InferType<typeof step3Schema>;
