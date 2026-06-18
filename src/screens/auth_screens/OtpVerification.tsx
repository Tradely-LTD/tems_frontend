import { AuthCard } from '@/components/Cards';
import { Input } from '@/components/Inputs';
import { Button } from '@/components/Buttons';
import { FormError } from '@/components/Text';
import { useOtpVerification } from './hooks/useOtpVerification';

export default function OtpVerification() {
  const {
    register,
    handleSubmit,
    errors,
    onResend,
    isVerifying,
    verifyError,
    resendError,
    resendCooldown,
  } = useOtpVerification();

  return (
    <AuthCard>
      <h1 className="text-[24px] font-bold text-jet-text mb-1">Verify Your Phone</h1>
      <p className="text-[14px] text-steel-ink mb-6">
        Enter the 6-digit code sent to your phone number.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          id="otp"
          label="Verification Code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          placeholder="000000"
          error={errors.otp?.message}
          className="font-mono tracking-[0.3em] text-center text-[20px]"
          {...register('otp')}
        />

        {verifyError && <FormError message={verifyError} />}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="submit"
            label="Verify Code"
            variant="primary"
            fullWidth
            loading={isVerifying}
          />

          <Button
            type="button"
            label={resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            variant="ghost"
            fullWidth
            disabled={resendCooldown > 0}
            onClick={onResend}
          />
        </div>
      </form>

      {resendError && <FormError message={resendError} className="text-center" />}
    </AuthCard>
  );
}
