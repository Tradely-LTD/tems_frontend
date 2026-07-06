import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useChangeEmail } from './hooks/useChangeEmail';
import {
  initiateEmailChangeSchema,
  confirmEmailChangeSchema,
} from './schema/profileValidationSchema';
import type {
  InitiateEmailChangeFormValues,
  ConfirmEmailChangeFormValues,
} from './schema/profileValidationSchema';
import { ROUTES } from '@/constants/routes';

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function InitiateStep({
  onSubmit,
  isLoading,
  error,
}: {
  onSubmit: (values: InitiateEmailChangeFormValues) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InitiateEmailChangeFormValues>({
    resolver: yupResolver(initiateEmailChangeSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && (
        <div className="bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.2)] rounded-lg px-4 py-3 text-[#ba1a1a] text-[13px]">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="new_email" className="block text-[12px] font-medium text-[#444650] mb-1">
          New email address
        </label>
        <input
          {...register('new_email')}
          id="new_email"
          type="email"
          placeholder="you@example.com"
          className={[
            'w-full px-3 py-2.5 rounded-lg border text-[14px] text-[#1a1b20] focus:outline-none focus:ring-2 focus:ring-[#002366]/20 transition-colors',
            errors.new_email ? 'border-[#ba1a1a] bg-[rgba(186,26,26,0.04)]' : 'border-[#c5c6d2] bg-white hover:border-[#002366]',
          ].join(' ')}
        />
        {errors.new_email && (
          <p className="text-[11px] text-[#ba1a1a] mt-0.5">{errors.new_email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-[#002366] text-white text-[14px] font-semibold hover:bg-[#00113a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending code…' : 'Send verification code'}
      </button>
    </form>
  );
}

function ConfirmStep({
  newEmail,
  onSubmit,
  isLoading,
  error,
}: {
  newEmail: string;
  onSubmit: (values: ConfirmEmailChangeFormValues) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmEmailChangeFormValues>({
    resolver: yupResolver(confirmEmailChangeSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <p className="text-[13px] text-[#64748b]">
        Code sent to <span className="font-semibold text-[#1a1b20]">{newEmail}</span>. Enter the 6-digit code below.
      </p>

      {error && (
        <div className="bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.2)] rounded-lg px-4 py-3 text-[#ba1a1a] text-[13px]">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="otp" className="block text-[12px] font-medium text-[#444650] mb-1">
          Verification code
        </label>
        <input
          {...register('otp')}
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className={[
            'w-full px-3 py-2.5 rounded-lg border text-[14px] text-[#1a1b20] font-mono tracking-[0.2em] text-center focus:outline-none focus:ring-2 focus:ring-[#002366]/20 transition-colors',
            errors.otp ? 'border-[#ba1a1a] bg-[rgba(186,26,26,0.04)]' : 'border-[#c5c6d2] bg-white hover:border-[#002366]',
          ].join(' ')}
        />
        {errors.otp && (
          <p className="text-[11px] text-[#ba1a1a] mt-0.5">{errors.otp.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-[#002366] text-white text-[14px] font-semibold hover:bg-[#00113a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Verifying…' : 'Confirm email change'}
      </button>
    </form>
  );
}

export default function ChangeEmailScreen() {
  const {
    step,
    newEmail,
    handleInitiate,
    handleConfirm,
    isInitiating,
    isConfirming,
    initiateError,
    confirmError,
  } = useChangeEmail();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back link */}
      <Link
        to={ROUTES.PROFILE}
        className="inline-flex items-center gap-1.5 text-[13px] text-[#002366] font-medium hover:underline"
      >
        <BackIcon />
        Back to Profile
      </Link>

      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A]">Change Email Address</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">
          {step === 'initiate'
            ? 'Enter your new email address. We will send a verification code.'
            : 'Enter the verification code sent to your new email. You will be signed out after confirmation.'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${step === 'initiate' ? 'bg-[#002366] text-white' : 'bg-[#9ff4c9] text-[#065f46]'}`}>
          {step === 'confirm' ? '✓' : '1'}
        </div>
        <div className="flex-1 h-px bg-[#c5c6d2]" />
        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${step === 'confirm' ? 'bg-[#002366] text-white' : 'bg-[#e2e4ed] text-[#94a3b8]'}`}>
          2
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e4ed] shadow-sm p-6">
        {step === 'initiate' ? (
          <InitiateStep
            onSubmit={handleInitiate}
            isLoading={isInitiating}
            error={initiateError}
          />
        ) : (
          <ConfirmStep
            newEmail={newEmail}
            onSubmit={handleConfirm}
            isLoading={isConfirming}
            error={confirmError}
          />
        )}
      </div>
    </div>
  );
}
