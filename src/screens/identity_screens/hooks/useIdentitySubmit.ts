import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { profileSchema } from '../schema/identityValidationSchema';
import type { ProfileFormValues } from '../schema/identityValidationSchema';
import { useGetIdentityProfileQuery, useSubmitProfileMutation } from '../services/identitySlice';
import type {
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';

interface UseIdentitySubmitOptions {
  onSuccess: () => void;
  hasProfile: boolean;
  /** Previously-saved values from the parent (used to restore form state after Back from Step 2) */
  savedValues?: Record<string, string>;
  /** Callback so the parent can persist values whenever the form changes */
  onValuesChange?: (values: Record<string, string>) => void;
}

interface UseIdentitySubmitResult {
  register: UseFormRegister<ProfileFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<ProfileFormValues>;
  isSubmitting: boolean;
  apiError: string | null;
  isFetchingProfile: boolean;
}

export function useIdentitySubmit({
  onSuccess,
  hasProfile,
  savedValues,
  onValuesChange,
}: UseIdentitySubmitOptions): UseIdentitySubmitResult {
  const [apiError, setApiError] = useState<string | null>(null);
  const populatedRef = useRef(false);

  // If the parent already has saved values (user came back from Step 2), use them as the
  // initial form state so the user sees their data again rather than the raw API data (AC-15).
  const hasSavedValues = savedValues !== undefined && Object.keys(savedValues).length > 0;

  const { data: profileData, isFetching: isFetchingProfile } = useGetIdentityProfileQuery(undefined, {
    skip: !hasProfile,
  });

  const [submitProfile, { isLoading: isSubmitting }] = useSubmitProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema),
    // Seed from savedValues when available; otherwise start empty and let the
    // API-population effect below fill in on the first mount.
    defaultValues: hasSavedValues
      ? {
          nin: savedValues.nin ?? '',
          tin: savedValues.tin ?? '',
          bvn: savedValues.bvn ?? '',
          date_of_birth: savedValues.date_of_birth ?? '',
          address: savedValues.address ?? '',
        }
      : {
          nin: '',
          tin: '',
          bvn: '',
          date_of_birth: '',
          address: '',
        },
  });

  // Pre-populate from API only on the very first mount and only when no saved values exist.
  useEffect(() => {
    if (profileData && !populatedRef.current && !hasSavedValues) {
      populatedRef.current = true;
      const p = profileData.data;
      reset({
        nin: p.nin ?? '',
        tin: p.tin ?? '',
        bvn: p.bvn ?? '',
        date_of_birth: p.date_of_birth ?? '',
        address: p.address ?? '',
      });
    }
  }, [profileData, reset, hasSavedValues]);

  // Sync form values to the parent whenever they change so they survive unmount (AC-15).
  const watchedValues = watch();
  useEffect(() => {
    if (onValuesChange) {
      const snapshot: Record<string, string> = {};
      for (const [key, value] of Object.entries(watchedValues)) {
        snapshot[key] = (value as string) ?? '';
      }
      onValuesChange(snapshot);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedValues.nin,
    watchedValues.tin,
    watchedValues.bvn,
    watchedValues.date_of_birth,
    watchedValues.address,
    onValuesChange,
  ]);

  const onSubmit = handleSubmit(async (values: ProfileFormValues) => {
    setApiError(null);

    // Strip empty/undefined keys before sending
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      if (value !== '' && value !== undefined) {
        payload[key] = value as string;
      }
    }

    try {
      await submitProfile(payload).unwrap();
      onSuccess();
    } catch (err: unknown) {
      const errorData = err as { data?: { message?: string } };
      setApiError(
        errorData?.data?.message ?? 'Submission failed. Please try again.'
      );
    }
  });

  return {
    register,
    onSubmit,
    errors,
    isSubmitting,
    apiError,
    isFetchingProfile,
  };
}
