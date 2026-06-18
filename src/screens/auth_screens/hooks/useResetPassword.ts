import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { resetPasswordValidationSchema } from '../schema/resetPasswordValidationSchema';
import { useResetPasswordMutation } from '../services/authSlice';
import { ROUTES } from '@/constants/routes';

interface ResetFormValues {
  password: string;
  confirm_password: string;
}

export function useResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenError, setIsTokenError] = useState(!token);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: yupResolver(resetPasswordValidationSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setIsTokenError(true);
      return;
    }
    setApiError(null);
    try {
      await resetPassword({ token, password: values.password }).unwrap();
      setIsSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err: unknown) {
      const error = err as { status?: number };
      if (error?.status === 400 || error?.status === 401) {
        setIsTokenError(true);
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    }
  });

  return { register, handleSubmit: onSubmit, errors, isLoading, isSuccess, isTokenError, apiError };
}
