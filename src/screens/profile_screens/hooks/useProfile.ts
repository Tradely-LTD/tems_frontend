import { useState } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../services/profileSlice';
import type { UpdateProfileRequest } from '../services/types';

export interface UseProfileResult {
  profile: ReturnType<typeof useGetProfileQuery>['data'];
  isLoading: boolean;
  error: ReturnType<typeof useGetProfileQuery>['error'];
  handleUpdate: (values: UpdateProfileRequest) => Promise<boolean>;
  isUpdating: boolean;
  updateError: string | null;
}

export function useProfile(): UseProfileResult {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { data, isLoading, error } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  async function handleUpdate(values: UpdateProfileRequest): Promise<boolean> {
    setUpdateError(null);
    try {
      await updateProfile(values).unwrap();
      return true;
    } catch (err: unknown) {
      const errorData = err as { data?: { message?: string } };
      setUpdateError(errorData?.data?.message ?? 'Failed to update profile. Please try again.');
      return false;
    }
  }

  return {
    profile: data,
    isLoading,
    error,
    handleUpdate,
    isUpdating,
    updateError,
  };
}
