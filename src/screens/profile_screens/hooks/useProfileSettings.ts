import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../services/profileSlice';
import type { UpdateSettingsRequest } from '../services/types';

export interface UseProfileSettingsResult {
  settings: ReturnType<typeof useGetSettingsQuery>['data'];
  isLoading: boolean;
  roleName: string | undefined;
  handleUpdate: (values: UpdateSettingsRequest) => Promise<boolean>;
  isUpdating: boolean;
  error: string | null;
}

export function useProfileSettings(): UseProfileSettingsResult {
  const [error, setError] = useState<string | null>(null);
  const roleName = useSelector((state: RootState) => state.auth.user?.role_name);
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  async function handleUpdate(values: UpdateSettingsRequest): Promise<boolean> {
    setError(null);
    try {
      await updateSettings(values).unwrap();
      return true;
    } catch (err: unknown) {
      const errorData = err as { data?: { message?: string } };
      setError(errorData?.data?.message ?? 'Failed to update settings. Please try again.');
      return false;
    }
  }

  return {
    settings: data,
    isLoading,
    roleName,
    handleUpdate,
    isUpdating,
    error,
  };
}
