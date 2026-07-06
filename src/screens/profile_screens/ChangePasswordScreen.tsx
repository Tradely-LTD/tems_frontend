import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useChangePassword } from './hooks/useChangePassword';
import { changePasswordSchema } from './schema/profileValidationSchema';
import type { ChangePasswordFormValues } from './schema/profileValidationSchema';
import { ROUTES } from '@/constants/routes';

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function PasswordField({
  label,
  id,
  registration,
  error,
}: {
  label: string;
  id: string;
  registration: ReturnType<ReturnType<typeof useForm>['register']>;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] font-medium text-[#444650] mb-1">
        {label}
      </label>
      <input
        {...registration}
        id={id}
        type="password"
        autoComplete="off"
        className={[
          'w-full px-3 py-2.5 rounded-lg border text-[14px] text-[#1a1b20] focus:outline-none focus:ring-2 focus:ring-[#002366]/20 transition-colors',
          error ? 'border-[#ba1a1a] bg-[rgba(186,26,26,0.04)]' : 'border-[#c5c6d2] bg-white hover:border-[#002366]',
        ].join(' ')}
      />
      {error && <p className="text-[11px] text-[#ba1a1a] mt-0.5">{error}</p>}
    </div>
  );
}

export default function ChangePasswordScreen() {
  const { handleChangePassword, isLoading, error } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    await handleChangePassword(values);
  }

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
        <h1 className="text-[22px] font-bold text-[#0F172A]">Change Password</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">
          After changing your password you will be signed out and redirected to log in again.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e4ed] shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {error && (
            <div className="bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.2)] rounded-lg px-4 py-3 text-[#ba1a1a] text-[13px]">
              {error}
            </div>
          )}

          <PasswordField
            label="Current password"
            id="current_password"
            registration={register('current_password')}
            error={errors.current_password?.message}
          />

          <PasswordField
            label="New password"
            id="new_password"
            registration={register('new_password')}
            error={errors.new_password?.message}
          />

          <PasswordField
            label="Confirm new password"
            id="confirm_password"
            registration={register('confirm_password')}
            error={errors.confirm_password?.message}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#002366] text-white text-[14px] font-semibold hover:bg-[#00113a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Changing password…' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}
