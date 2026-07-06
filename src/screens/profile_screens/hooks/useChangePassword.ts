import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/screens/auth_screens/services/authSlice';
import { useChangePasswordMutation } from '../services/profileSlice';
import { ROUTES } from '@/constants/routes';

export interface ChangePasswordValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UseChangePasswordResult {
  handleChangePassword: (values: ChangePasswordValues) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useChangePassword(): UseChangePasswordResult {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  async function handleChangePassword(values: ChangePasswordValues): Promise<void> {
    setError(null);
    // Strip confirm_password before sending to backend
    const { confirm_password: _confirm, ...payload } = values;
    void _confirm;

    try {
      await changePassword(payload).unwrap();
      dispatch(clearAuth());
      navigate(ROUTES.LOGIN);
    } catch (err: unknown) {
      const errorData = err as { status?: number; data?: { message?: string } };
      if (errorData?.status === 401) {
        setError('Current password is incorrect.');
      } else if (errorData?.status === 422) {
        setError('New password must differ from current password.');
      } else {
        setError(errorData?.data?.message ?? 'Failed to change password. Please try again.');
      }
    }
  }

  return {
    handleChangePassword,
    isLoading,
    error,
  };
}
