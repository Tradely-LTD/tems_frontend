import { Input } from '@/components/Inputs';
import { Button } from '@/components/Buttons';
import FormError from '@/components/Text/FormError';
import { useIdentitySubmit } from './hooks/useIdentitySubmit';

interface IdentityProfileFormProps {
  onSuccess: () => void;
  onBack: () => void;
  hasProfile: boolean;
  /** Values saved by the parent so form data survives unmount/remount (AC-15) */
  savedValues?: Record<string, string>;
  /** Called whenever form values change so the parent can persist them */
  onValuesChange?: (values: Record<string, string>) => void;
}

export default function IdentityProfileForm({
  onSuccess,
  onBack,
  hasProfile,
  savedValues,
  onValuesChange,
}: IdentityProfileFormProps) {
  const { register, onSubmit, errors, isSubmitting, apiError, isFetchingProfile } =
    useIdentitySubmit({ onSuccess, hasProfile, savedValues, onValuesChange });

  return (
    <div className="bg-white border border-[#c5c6d2] rounded p-6">
      <h2 className="text-[16px] font-semibold text-[#002366] mb-5">Identity Details</h2>

      {isFetchingProfile && (
        <p className="text-[13px] text-[#444650] mb-4">Loading existing profile data...</p>
      )}

      <form onSubmit={onSubmit} noValidate>
        {apiError && <FormError message={apiError} className="mb-4" />}

        <div className="flex flex-col gap-4">
          <div>
            <Input
              id="nin"
              label="NIN (National Identification Number)"
              type="text"
              placeholder="Enter your NIN"
              {...register('nin')}
            />
            {errors.nin?.message && <FormError message={errors.nin.message} />}
          </div>

          <div>
            <Input
              id="tin"
              label="TIN (Tax Identification Number)"
              type="text"
              placeholder="Enter your TIN"
              {...register('tin')}
            />
            {errors.tin?.message && <FormError message={errors.tin.message} />}
          </div>

          <div>
            <Input
              id="bvn"
              label="BVN (Bank Verification Number)"
              type="text"
              placeholder="Enter your BVN"
              {...register('bvn')}
            />
            {errors.bvn?.message && <FormError message={errors.bvn.message} />}
          </div>

          <div>
            <Input
              id="date_of_birth"
              label="Date of Birth"
              type="date"
              {...register('date_of_birth')}
            />
            {errors.date_of_birth?.message && (
              <FormError message={errors.date_of_birth.message} />
            )}
          </div>

          <div>
            <Input
              id="address"
              label="Address"
              type="text"
              placeholder="Enter your address"
              {...register('address')}
            />
            {errors.address?.message && <FormError message={errors.address.message} />}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 gap-3">
          <Button
            label="Back"
            variant="secondary"
            type="button"
            onClick={onBack}
          />
          <Button
            label="Continue"
            variant="primary"
            type="submit"
            loading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
