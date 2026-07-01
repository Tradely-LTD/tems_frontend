import * as yup from 'yup';
import type { InferType } from 'yup';

export const profileSchema = yup.object({
  nin: yup.string().optional(),
  tin: yup.string().optional(),
  bvn: yup.string().optional(),
  date_of_birth: yup
    .string()
    .optional()
    .test(
      'date-format',
      'Date of birth must be in YYYY-MM-DD format',
      (value) => {
        if (!value || value === '') return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      }
    ),
  address: yup.string().optional(),
});

export const documentSchema = yup.object({
  id_type: yup
    .string()
    .oneOf(
      ['national_id', 'drivers_licence', 'voters_card', 'passport'],
      'Please select a valid document type'
    )
    .required('Document type is required'),
  document_file: yup
    .mixed<FileList>()
    .required('Please attach your ID document')
    .test('has-file', 'Please attach your ID document', (v) => v instanceof FileList && v.length > 0)
    .test('file-size', 'File must be under 5 MB', (v) => {
      if (!(v instanceof FileList) || v.length === 0) return true;
      return v[0].size <= 5 * 1024 * 1024;
    })
    .test('file-type', 'Only JPG, PNG, or PDF files are allowed', (v) => {
      if (!(v instanceof FileList) || v.length === 0) return true;
      return ['image/jpeg', 'image/png', 'application/pdf'].includes(v[0].type);
    }),
  selfie_file: yup
    .mixed<FileList>()
    .optional()
    .test('selfie-size', 'Selfie must be under 5 MB', (v) => {
      if (!(v instanceof FileList) || v.length === 0) return true;
      return v[0].size <= 5 * 1024 * 1024;
    })
    .test('selfie-type', 'Only JPG or PNG files are allowed for selfie', (v) => {
      if (!(v instanceof FileList) || v.length === 0) return true;
      return ['image/jpeg', 'image/png'].includes(v[0].type);
    }),
});

export type ProfileFormValues = InferType<typeof profileSchema>;
export type DocumentFormValues = InferType<typeof documentSchema>;
