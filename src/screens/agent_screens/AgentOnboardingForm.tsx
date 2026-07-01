import { useState } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { Input } from '@/components/Inputs';
import { Button } from '@/components/Buttons';
import FormError from '@/components/Text/FormError';
import Unauthorized from '@/screens/auth_screens/Unauthorized';
import { useAgentOnboarding } from './hooks/useAgentOnboarding';
import { NIGERIAN_BANKS } from './constants/nigerianBanks';
import { NIGERIAN_STATE_NAMES, getLgasForState } from '@/constants/nigeria';

const MANAGE_ROLES = ['MarketAdmin', 'SubConcessionaireAdmin', 'NationalAdmin', 'SuperAdmin'];

export default function AgentOnboardingForm() {
  const roleName = useAppSelector((s) => s.auth.user?.role_name);

  if (!roleName || !MANAGE_ROLES.includes(roleName)) {
    return <Unauthorized />;
  }

  return <AgentOnboardingFormInner />;
}

function AgentOnboardingFormInner() {
  const { form, isLoading, apiError, marketOptions, onSubmit } = useAgentOnboarding();
  const { register, formState: { errors }, setValue, watch } = form;

  const [showPassword, setShowPassword] = useState(false);
  const selectedBankCode = watch('bank_code');
  const selectedMarketId = watch('market_id');
  const selectedState = watch('state');
  const lgaOptions = getLgasForState(selectedState);

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setValue('state', e.target.value, { shouldValidate: true });
    setValue('lga', '', { shouldValidate: false });
  }

  function handleBankChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const bank = NIGERIAN_BANKS.find((b) => b.code === e.target.value);
    if (bank) {
      setValue('bank_name', bank.name, { shouldValidate: true });
      setValue('bank_code', bank.code, { shouldValidate: true });
    }
  }

  function handleMarketChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setValue('market_id', e.target.value || null, { shouldValidate: true });
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1a1b20] leading-tight">Invite New Agent</h1>
        <p className="text-[14px] text-[#444650] mt-1">
          Create a new trade agent account on the TeMS platform.
        </p>
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded p-6">
        <form onSubmit={onSubmit} noValidate>
          {apiError && <FormError message={apiError} className="mb-4" />}

          {/* Section 1 — Account Credentials */}
          <p className="text-[13px] font-semibold text-[#444650] uppercase tracking-wide mb-3">Account Credentials</p>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="e.g. agent@example.com"
                {...register('email')}
              />
              {errors.email?.message && <FormError message={errors.email.message} />}
            </div>

            <div>
              <Input
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="+2348012345678"
                {...register('phone')}
              />
              {errors.phone?.message && <FormError message={errors.phone.message} />}
            </div>

            <div>
              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[34px] text-[12px] text-[#444650] hover:text-[#1a1b20]"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password?.message && <FormError message={errors.password.message} />}
            </div>
          </div>

          {/* Section 2 — Personal Details */}
          <p className="text-[13px] font-semibold text-[#444650] uppercase tracking-wide mb-3">Personal Details</p>

          <div className="flex flex-col gap-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  id="first_name"
                  label="First Name"
                  type="text"
                  placeholder="e.g. Amina"
                  {...register('first_name')}
                />
                {errors.first_name?.message && <FormError message={errors.first_name.message} />}
              </div>
              <div>
                <Input
                  id="last_name"
                  label="Surname / Last Name"
                  type="text"
                  placeholder="e.g. Ibrahim"
                  {...register('last_name')}
                />
                {errors.last_name?.message && <FormError message={errors.last_name.message} />}
              </div>
            </div>

            <div>
              <Input
                id="middle_name"
                label="Middle Name (optional)"
                type="text"
                placeholder="e.g. Chioma"
                {...register('middle_name')}
              />
              {errors.middle_name?.message && <FormError message={errors.middle_name.message} />}
            </div>

            <div>
              <Input
                id="dob"
                label="Date of Birth (optional)"
                type="date"
                {...register('dob')}
              />
              {errors.dob?.message && <FormError message={errors.dob.message} />}
            </div>

            <div>
              <Input
                id="address"
                label="Address (optional)"
                type="text"
                placeholder="e.g. 12 Market Road, Kano"
                {...register('address')}
              />
              {errors.address?.message && <FormError message={errors.address.message} />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state_select" className="block text-[13px] font-medium text-[#1a1b20] mb-1">
                  State (optional)
                </label>
                <select
                  id="state_select"
                  className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                  value={selectedState ?? ''}
                  onChange={handleStateChange}
                >
                  <option value="">Select state…</option>
                  {NIGERIAN_STATE_NAMES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lga_select" className="block text-[13px] font-medium text-[#1a1b20] mb-1">
                  LGA (optional)
                </label>
                <select
                  id="lga_select"
                  className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5] disabled:opacity-50"
                  disabled={!selectedState}
                  {...register('lga')}
                >
                  <option value="">{selectedState ? 'Select LGA…' : 'Select a state first'}</option>
                  {lgaOptions.map((l) => (
                    <option key={l.name} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3 — Bank Details */}
          <p className="text-[13px] font-semibold text-[#444650] uppercase tracking-wide mb-3">Bank Details</p>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label htmlFor="bank_select" className="block text-[13px] font-medium text-[#1a1b20] mb-1">
                Bank Name
              </label>
              <select
                id="bank_select"
                className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                value={selectedBankCode ?? ''}
                onChange={handleBankChange}
              >
                <option value="" disabled>Select a bank…</option>
                {NIGERIAN_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              {errors.bank_name?.message && <FormError message={errors.bank_name.message} />}
              {/* hidden inputs keep RHF registration */}
              <input type="hidden" {...register('bank_name')} />
              <input type="hidden" {...register('bank_code')} />
            </div>

            <div>
              <Input
                id="bank_account"
                label="Account Number"
                type="text"
                placeholder="10-digit NUBAN account number"
                maxLength={10}
                {...register('bank_account')}
              />
              {errors.bank_account?.message && <FormError message={errors.bank_account.message} />}
            </div>
          </div>

          {/* Section 4 — Assignment (optional) */}
          <p className="text-[13px] font-semibold text-[#444650] uppercase tracking-wide mb-3">Assignment (optional)</p>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="market_select" className="block text-[13px] font-medium text-[#1a1b20] mb-1">
                Market
              </label>
              <select
                id="market_select"
                className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5] disabled:opacity-50"
                value={selectedMarketId ?? ''}
                onChange={handleMarketChange}
                disabled={marketOptions.length === 0}
              >
                <option value="">No market assigned</option>
                {marketOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.market_id?.message && <FormError message={errors.market_id.message} />}
            </div>

            <div>
              <label htmlFor="tier_select" className="block text-[13px] font-medium text-[#1a1b20] mb-1">
                Tier
              </label>
              <select
                id="tier_select"
                className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                defaultValue={2}
                {...register('tier', { valueAsNumber: true })}
              >
                {[1, 2, 3, 4, 5].map((t) => (
                  <option key={t} value={t}>Tier {t}</option>
                ))}
              </select>
              {errors.tier?.message && <FormError message={errors.tier.message} />}
            </div>
          </div>

          <div className="mt-6">
            <Button
              label="Invite Agent"
              variant="primary"
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
            />
          </div>
        </form>
      </div>
    </div>
  );
}
