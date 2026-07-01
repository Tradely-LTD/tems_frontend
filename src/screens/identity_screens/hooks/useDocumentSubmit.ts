import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { documentSchema } from '../schema/identityValidationSchema';
import type { DocumentFormValues } from '../schema/identityValidationSchema';
import { useSubmitDocumentMutation } from '../services/identitySlice';
import type { DocumentIdType } from '../services/types';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { useAppSelector } from '@/hooks/useAppSelector';
import { uploadKycFile } from '@/config/supabase';

interface UseDocumentSubmitOptions {
  onSuccess: () => void;
}

interface UseDocumentSubmitResult {
  control: Control<DocumentFormValues>;
  register: UseFormRegister<DocumentFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<DocumentFormValues>;
  isSubmitting: boolean;
  uploadProgress: string | null;
  apiError: string | null;
  isProfileNotFound: boolean;
}

export function useDocumentSubmit({ onSuccess }: UseDocumentSubmitOptions): UseDocumentSubmitResult {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isProfileNotFound, setIsProfileNotFound] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const userId = useAppSelector((s) => s.auth.user?.id ?? 'unknown');

  const [submitDocument, { isLoading: isMutating }] = useSubmitDocumentMutation();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<DocumentFormValues>({
    resolver: yupResolver(documentSchema),
    defaultValues: {
      id_type: undefined,
      document_file: undefined,
      selfie_file: undefined,
    },
  });

  const isSubmitting = isMutating || isFormSubmitting;

  const onSubmit = handleSubmit(async (values: DocumentFormValues) => {
    setApiError(null);
    setIsProfileNotFound(false);

    try {
      // Upload ID document to Supabase Storage
      setUploadProgress('Uploading ID document…');
      const docFile = values.document_file![0];
      const documentUrl = await uploadKycFile(userId, docFile, 'documents');

      // Upload selfie if provided
      let selfieUrl: string | undefined;
      if (values.selfie_file && values.selfie_file.length > 0) {
        setUploadProgress('Uploading selfie…');
        selfieUrl = await uploadKycFile(userId, values.selfie_file[0], 'selfies');
      }

      setUploadProgress('Saving record…');
      await submitDocument({
        id_type: values.id_type as DocumentIdType,
        document_url: documentUrl,
        ...(selfieUrl ? { selfie_url: selfieUrl } : {}),
      }).unwrap();

      setUploadProgress(null);
      onSuccess();
    } catch (err: unknown) {
      setUploadProgress(null);
      const errorData = err as { status?: number; data?: { message?: string }; message?: string };
      if (errorData?.status === 404) {
        setIsProfileNotFound(true);
      } else {
        setApiError(
          errorData?.data?.message ?? errorData?.message ?? 'Submission failed. Please try again.'
        );
      }
    }
  });

  return {
    control,
    register,
    onSubmit,
    errors,
    isSubmitting,
    uploadProgress,
    apiError,
    isProfileNotFound,
  };
}
