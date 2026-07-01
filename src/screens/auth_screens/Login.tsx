import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '@/components/Cards';
import { Input } from '@/components/Inputs';
import { Button } from '@/components/Buttons';
import { FormError } from '@/components/Text';
import { useLogin } from './hooks/useLogin';
import { ROUTES } from '@/constants/routes';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-steel-ink"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-steel-ink"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

export default function Login() {
  const { register, handleSubmit, errors, isLoading, apiError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthCard>
      <h1 className="text-[24px] font-bold text-jet-text mb-1">Welcome back</h1>
      <p className="text-[14px] text-steel-ink mb-6">Sign in to your TeMS account</p>

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

          <Input
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            rightAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-steel-ink hover:text-jet-text focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            }
            {...register('password')}
          />
        </div>

        {apiError && <FormError message={apiError} />}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="submit"
            label="Sign In"
            variant="primary"
            fullWidth
            loading={isLoading}
          />
        </div>
      </form>

      <div className="mt-4 text-center">
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="text-[14px] text-royal-navy hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <div className="mt-3 text-center">
        <Link to={ROUTES.REGISTER_SUBCONCESSIONAIRE} className="text-[14px] text-royal-navy hover:underline">
          Register as Subconcessionaire
        </Link>
      </div>
    </AuthCard>
  );
}
