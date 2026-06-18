import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { otpValidationSchema } from '../schema/otpValidationSchema';
import { useSendOtpMutation, useVerifyOtpMutation } from '../services/authSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';

interface OtpFormValues {
  otp: string;
}

export function useOtpVerification() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const phone = user?.phone ?? '';

  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setResendCooldown(60);
    timerRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (phone) {
      sendOtp({ phone }).catch(() => {});
      startCooldown();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OtpFormValues>({
    resolver: yupResolver(otpValidationSchema),
  });

  const onVerify = handleSubmit(async (values) => {
    setVerifyError(null);
    try {
      await verifyOtp({ phone, otp: values.otp }).unwrap();
      navigate(ROUTES.HOME);
    } catch (err: unknown) {
      reset();
      const error = err as { data?: { message?: string } };
      const msg = error?.data?.message ?? 'Incorrect code. Please try again.';
      setVerifyError(msg);
    }
  });

  const onResend = async () => {
    if (resendCooldown > 0) return;
    setResendError(null);
    try {
      await sendOtp({ phone }).unwrap();
      startCooldown();
    } catch (err: unknown) {
      const error = err as { status?: number };
      if (error?.status === 429) {
        setResendError('Please wait before requesting another code.');
        startCooldown();
      } else {
        setResendError('Failed to resend code. Please try again.');
      }
    }
  };

  return {
    register,
    handleSubmit: onVerify,
    errors,
    onResend,
    isVerifying,
    isSending,
    verifyError,
    resendError,
    resendCooldown,
  };
}
