import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { forgotPasswordValidationSchema } from '../schema/forgotPasswordValidationSchema';
import { useForgotPasswordMutation } from '../services/authSlice';

interface ForgotFormValues {
  email: string;
}

export function useForgotPassword() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: yupResolver(forgotPasswordValidationSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await forgotPassword(values).unwrap();
      setIsSuccess(true);
    } catch {
      setApiError('Something went wrong. Please try again.');
    }
  });

  return { register, handleSubmit: onSubmit, errors, isLoading, isSuccess, apiError };
}
