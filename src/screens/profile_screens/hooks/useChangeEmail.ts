import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/screens/auth_screens/services/authSlice';
import { useInitiateEmailChangeMutation, useConfirmEmailChangeMutation } from '../services/profileSlice';
import { ROUTES } from '@/constants/routes';

export type EmailChangeStep = 'initiate' | 'confirm';

export interface InitiateValues {
  new_email: string;
}

export interface ConfirmValues {
  otp: string;
}

export interface UseChangeEmailResult {
  step: EmailChangeStep;
  newEmail: string;
  handleInitiate: (values: InitiateValues) => Promise<void>;
  handleConfirm: (values: ConfirmValues) => Promise<void>;
  isInitiating: boolean;
  isConfirming: boolean;
  initiateError: string | null;
  confirmError: string | null;
}

export function useChangeEmail(): UseChangeEmailResult {
  const [step, setStep] = useState<EmailChangeStep>('initiate');
  const [newEmail, setNewEmail] = useState('');
  const [initiateError, setInitiateError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [initiateEmailChange, { isLoading: isInitiating }] = useInitiateEmailChangeMutation();
  const [confirmEmailChange, { isLoading: isConfirming }] = useConfirmEmailChangeMutation();

  async function handleInitiate(values: InitiateValues): Promise<void> {
    setInitiateError(null);
    try {
      await initiateEmailChange({ new_email: values.new_email }).unwrap();
      setNewEmail(values.new_email);
      setStep('confirm');
    } catch (err: unknown) {
      const errorData = err as { data?: { message?: string } };
      setInitiateError(errorData?.data?.message ?? 'Failed to send verification code. Please try again.');
    }
  }

  async function handleConfirm(values: ConfirmValues): Promise<void> {
    setConfirmError(null);
    try {
      await confirmEmailChange({ otp: values.otp }).unwrap();
      dispatch(clearAuth());
      navigate(ROUTES.LOGIN);
    } catch (err: unknown) {
      const errorData = err as { data?: { message?: string } };
      setConfirmError(errorData?.data?.message ?? 'Failed to verify code. Please try again.');
    }
  }

  return {
    step,
    newEmail,
    handleInitiate,
    handleConfirm,
    isInitiating,
    isConfirming,
    initiateError,
    confirmError,
  };
}
