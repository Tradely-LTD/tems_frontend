import { useState, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppSelector } from '@/hooks/useAppSelector';
import { levyConfigSchema, type LevyConfigFormValues } from '../schema/levyConfigValidationSchema';
import { useGetLevyConfigQuery, useUpsertLevyConfigMutation } from '../services/levyConfigSlice';
import type { LevyMode, CommissionType } from '../services/types';

interface UseLevyConfigResult {
  form: UseFormReturn<LevyConfigFormValues>;
  isEditable: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isSubmitting: boolean;
  fetchError: unknown;
  submitError: unknown;
  submitSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
  levyMode: LevyMode;
  commissionType: CommissionType;
}

const DEFAULT_VALUES: LevyConfigFormValues = {
  levy_mode: 'flat',
  flat_levy_amount: 0,
  commission_type: 'flat',
  commission_flat_amount: 0,
  commission_percentage: 0,
};

export function useLevyConfig(): UseLevyConfigResult {
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const roleName = useAppSelector((s) => s.auth.user?.role_name ?? null);
  const isEditable = roleName === 'SuperAdmin' || roleName === 'JRBAccount';

  const { data, isLoading, isFetching, error: fetchError } = useGetLevyConfigQuery();
  const [upsertLevyConfig, { isLoading: isSubmitting }] = useUpsertLevyConfigMutation();

  const form = useForm<LevyConfigFormValues>({
    resolver: yupResolver(levyConfigSchema),
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: false,
  });

  const { reset, handleSubmit, watch } = form;

  // Populate the form when API data arrives
  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      reset({
        levy_mode: d.levy_mode,
        flat_levy_amount: d.flat_levy_amount,
        commission_type: d.commission_type,
        commission_flat_amount: d.commission_flat_amount,
        commission_percentage: d.commission_percentage,
      });
    }
  }, [data, reset]);

  const levyMode = watch('levy_mode') as LevyMode;
  const commissionType = watch('commission_type') as CommissionType;

  const onSubmit = handleSubmit(async (values: LevyConfigFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await upsertLevyConfig(values).unwrap();
      setSubmitSuccess(true);
    } catch (err: unknown) {
      setSubmitError(err);
    }
  });

  return {
    form,
    isEditable,
    isLoading,
    isFetching,
    isSubmitting,
    fetchError,
    submitError,
    submitSuccess,
    onSubmit,
    levyMode,
    commissionType,
  };
}
