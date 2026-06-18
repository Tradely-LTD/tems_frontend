import { Link } from 'react-router-dom';
import { AuthCard } from '@/components/Cards';
import { Input } from '@/components/Inputs';
import { Button } from '@/components/Buttons';
import { FormError } from '@/components/Text';
import { useResetPassword } from './hooks/useResetPassword';
import { ROUTES } from '@/constants/routes';

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-caution-gold mx-auto mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-institutional-emerald mx-auto mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function ResetPassword() {
  const { register, handleSubmit, errors, isLoading, isSuccess, isTokenError, apiError } =
    useResetPassword();

  if (isTokenError) {
    return (
      <AuthCard>
        <div className="text-center py-4">
          <WarningIcon />
          <h2 className="text-[18px] font-semibold text-jet-text mb-2">
            Invalid or Expired Link
          </h2>
          <p className="text-[14px] text-steel-ink mb-6">
            This reset link has expired or is invalid.
          </p>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-[14px] text-royal-navy hover:underline"
          >
            Request a new reset link &rarr;
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard>
        <div className="text-center py-4">
          <CheckIcon />
          <h2 className="text-[18px] font-semibold text-jet-text mb-2">
            Password Reset Successfully
          </h2>
          <p className="text-steel-ink text-[14px]">Redirecting to login...</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <h1 className="text-[18px] font-semibold text-jet-text mb-6">Reset Password</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5">
          <Input
            id="password"
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            id="confirm_password"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />
        </div>

        {apiError && <FormError message={apiError} />}

        <div className="mt-6">
          <Button
            type="submit"
            label="Reset Password"
            variant="primary"
            fullWidth
            loading={isLoading}
          />
        </div>
      </form>
    </AuthCard>
  );
}
