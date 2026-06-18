import { Link } from 'react-router-dom';
import { AuthCard } from '@/components/Cards';
import { Input } from '@/components/Inputs';
import { Button } from '@/components/Buttons';
import { FormError } from '@/components/Text';
import { useForgotPassword } from './hooks/useForgotPassword';
import { ROUTES } from '@/constants/routes';

export default function ForgotPassword() {
  const { register, handleSubmit, errors, isLoading, isSuccess, apiError } =
    useForgotPassword();

  return (
    <AuthCard>
      <Link
        to={ROUTES.LOGIN}
        className="text-[14px] text-royal-navy hover:underline flex items-center gap-1 mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to login
      </Link>

      <h1 className="text-[18px] font-semibold text-jet-text mb-1">Forgot Password</h1>
      <p className="text-[14px] text-steel-ink mb-6">
        Enter your registered email address and we'll send you a reset link.
      </p>

      {isSuccess ? (
        <div className="bg-ghost-white border-l-4 border-institutional-emerald p-4 rounded">
          <p className="text-[14px] text-jet-text">
            If this email is registered, a reset link has been sent. Please check your inbox.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-5">
            <Input
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@organisation.gov.ng"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {apiError && <FormError message={apiError} />}

          <div className="mt-6">
            <Button
              type="submit"
              label="Send Reset Link"
              variant="primary"
              fullWidth
              loading={isLoading}
            />
          </div>
        </form>
      )}
    </AuthCard>
  );
}
