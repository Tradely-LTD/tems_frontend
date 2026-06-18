import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginValidationSchema } from '../schema/loginValidationSchema';
import { useLoginMutation } from '../services/authSlice';
import { ROUTES } from '@/constants/routes';

interface LoginFormValues {
  email: string;
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const result = await login(values).unwrap();
      if (!result.data.user.phone_verified) {
        navigate(ROUTES.OTP_VERIFICATION);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err: unknown) {
      const error = err as { status?: number };
      if (error?.status === 401) setApiError('Invalid email or password.');
      else if (error?.status === 403)
        setApiError('Your account has been suspended. Contact your administrator.');
      else setApiError('Something went wrong. Please try again.');
    }
  });

  return { register, handleSubmit: onSubmit, errors, isLoading, apiError };
}
