import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthCard } from '@/components/Cards';
import { Input } from '@/components/Inputs';
import { Button } from '@/components/Buttons';
import { Select } from '@/components/Select';
import { FormError } from '@/components/Text';
import Stepper from '@/components/Stepper/Stepper';
import { ROUTES } from '@/constants/routes';
import { useSubconcessionaireRegister } from './hooks/useSubconcessionaireRegister';
import {
  orgDetailsSchema,
  adminDetailsSchema,
  type OrgFormValues,
  type AdminFormValues,
} from './schema/subconcessionaireRegisterSchema';
import { useGetStatesQuery, useGetLgasQuery } from './services/locationSlice';

// ─── EyeIcon ──────────────────────────────────────────────────────────────────
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

// ─── Wizard steps config ──────────────────────────────────────────────────────
const WIZARD_STEPS = [
  { label: 'Org Type' },
  { label: 'Org Details' },
  { label: 'Admin Account' },
  { label: 'Review' },
];

type OrgCategory = 'private_company' | 'government_body' | 'trade_union';

const ORG_CATEGORY_OPTIONS: { value: OrgCategory; label: string }[] = [
  { value: 'private_company', label: 'Private Company' },
  { value: 'government_body', label: 'Government Body' },
  { value: 'trade_union', label: 'Trade Union' },
];

function orgCategoryLabel(cat: OrgCategory | null): string {
  if (!cat) return '';
  return ORG_CATEGORY_OPTIONS.find((o) => o.value === cat)?.label ?? cat;
}

// ─── Step 0: Org Type ─────────────────────────────────────────────────────────
interface StepOrgTypeProps {
  selected: OrgCategory | null;
  onSelect: (cat: OrgCategory) => void;
  onNext: () => void;
}

function StepOrgType({ selected, onSelect, onNext }: StepOrgTypeProps) {
  return (
    <div>
      <h2 className="text-[18px] font-semibold text-jet-text mb-1">Select Organisation Type</h2>
      <p className="text-[14px] text-steel-ink mb-6">
        Choose the category that best describes your organisation.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {ORG_CATEGORY_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`flex-1 rounded p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-[#002366] ring-2 ring-[#002366]/20 bg-[#f0f4ff]'
                  : 'border border-[#c5c6d2] bg-white hover:border-[#002366]'
              }`}
            >
              <span
                className={`text-[14px] font-semibold block ${
                  isSelected ? 'text-[#002366]' : 'text-jet-text'
                }`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        label="Next"
        variant="primary"
        fullWidth
        disabled={!selected}
        onClick={onNext}
      />
    </div>
  );
}

// ─── Step 1: Org Details ──────────────────────────────────────────────────────
interface StepOrgDetailsProps {
  defaultValues: OrgFormValues | null;
  onNext: (values: OrgFormValues) => void;
  onBack: () => void;
}

function StepOrgDetails({ defaultValues, onNext, onBack }: StepOrgDetailsProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrgFormValues>({
    resolver: yupResolver(orgDetailsSchema),
    defaultValues: defaultValues ?? {},
  });

  const stateId = watch('state_id');

  const { data: statesData, isError: statesError } = useGetStatesQuery();
  const { data: lgasData, isError: lgasError } = useGetLgasQuery(stateId, { skip: !stateId });

  const stateOptions = (statesData?.data ?? []).map((s) => ({ value: s.id, label: s.name }));
  const lgaOptions = (lgasData?.data ?? []).map((l) => ({ value: l.id, label: l.name }));

  const onSubmit = handleSubmit((values) => {
    onNext(values);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="text-[18px] font-semibold text-jet-text mb-1">Organisation Details</h2>
      <p className="text-[14px] text-steel-ink mb-6">
        Provide your organisation's official details.
      </p>

      <div className="flex flex-col gap-5">
        <Input
          id="name"
          label="Organisation Name"
          placeholder="e.g. Acme Logistics Ltd"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="registration_number"
          label="Registration Number"
          placeholder="e.g. RC123456"
          error={errors.registration_number?.message}
          {...register('registration_number')}
        />

        <div>
          <Controller
            name="state_id"
            control={control}
            render={({ field }) => (
              <Select
                id="state_id"
                label="State"
                options={stateOptions}
                value={field.value ?? ''}
                onChange={(val) => {
                  field.onChange(val);
                  setValue('lga_id', '');
                  setValue('lga_name', '');
                  const name = stateOptions.find((o) => o.value === val)?.label ?? '';
                  setValue('state_name', name);
                }}
                placeholder="Select a state"
                error={errors.state_id?.message}
              />
            )}
          />
          {statesError && (
            <p className="text-[13px] text-[#D83B01] mt-1">
              Could not load states. Please try again.
            </p>
          )}
        </div>

        <div>
          <Controller
            name="lga_id"
            control={control}
            render={({ field }) => (
              <Select
                id="lga_id"
                label="LGA"
                options={lgaOptions}
                value={field.value ?? ''}
                onChange={(val) => {
                  field.onChange(val);
                  const name = lgaOptions.find((o) => o.value === val)?.label ?? '';
                  setValue('lga_name', name);
                }}
                placeholder="Select an LGA"
                error={errors.lga_id?.message}
                disabled={!stateId}
              />
            )}
          />
          {lgasError && (
            <p className="text-[13px] text-[#D83B01] mt-1">
              Could not load LGAs. Please try again.
            </p>
          )}
        </div>

        <Input
          id="contact_email"
          label="Contact Email"
          type="email"
          placeholder="contact@organisation.ng"
          error={errors.contact_email?.message}
          {...register('contact_email')}
        />

        <Input
          id="contact_phone"
          label="Contact Phone"
          type="tel"
          placeholder="08012345678"
          error={errors.contact_phone?.message}
          {...register('contact_phone')}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="button" label="Back" variant="secondary" onClick={onBack} />
        <Button type="submit" label="Next" variant="primary" fullWidth />
      </div>
    </form>
  );
}

// ─── Step 2: Admin Details ────────────────────────────────────────────────────
interface StepAdminDetailsProps {
  defaultValues: AdminFormValues | null;
  onNext: (values: AdminFormValues) => void;
  onBack: () => void;
}

function StepAdminDetails({ defaultValues, onNext, onBack }: StepAdminDetailsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: yupResolver(adminDetailsSchema),
    defaultValues: defaultValues ?? {},
  });

  const onSubmit = handleSubmit((values) => {
    onNext(values);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="text-[18px] font-semibold text-jet-text mb-1">Administrator Account</h2>
      <p className="text-[14px] text-steel-ink mb-6">
        Set up the admin account for your organisation.
      </p>

      <div className="flex flex-col gap-5">
        <Input
          id="full_name"
          label="Full Name"
          placeholder="e.g. Amina Ibrahim"
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <Input
          id="admin_email"
          label="Email Address"
          type="email"
          placeholder="admin@organisation.ng"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="admin_phone"
          label="Phone Number"
          type="tel"
          placeholder="08012345678"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
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

        <Input
          id="confirm_password"
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter your password"
          error={errors.confirm_password?.message}
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-steel-ink hover:text-jet-text focus:outline-none"
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              <EyeIcon open={showConfirm} />
            </button>
          }
          {...register('confirm_password')}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="button" label="Back" variant="secondary" onClick={onBack} />
        <Button type="submit" label="Next" variant="primary" fullWidth />
      </div>
    </form>
  );
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────
interface ReviewRowProps {
  label: string;
  value: string;
}

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[12px] text-steel-ink uppercase tracking-wide">{label}</span>
      <span className="text-[14px] text-jet-text font-medium">{value}</span>
    </div>
  );
}

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ title, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="border border-[#c5c6d2] rounded p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-jet-text">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[13px] text-royal-navy hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

interface StepReviewProps {
  orgCategory: OrgCategory | null;
  orgValues: OrgFormValues | null;
  adminValues: AdminFormValues | null;
  apiError: string | null;
  isLoading: boolean;
  onBack: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}

function StepReview({
  orgCategory,
  orgValues,
  adminValues,
  apiError,
  isLoading,
  onBack,
  onEdit,
  onSubmit,
}: StepReviewProps) {
  return (
    <div>
      <h2 className="text-[18px] font-semibold text-jet-text mb-1">Review Your Application</h2>
      <p className="text-[14px] text-steel-ink mb-6">
        Please confirm the details below before submitting.
      </p>

      <ReviewSection title="Organisation Type" onEdit={() => onEdit(0)}>
        <ReviewRow label="Category" value={orgCategoryLabel(orgCategory)} />
      </ReviewSection>

      {orgValues && (
        <ReviewSection title="Organisation Details" onEdit={() => onEdit(1)}>
          <ReviewRow label="Name" value={orgValues.name} />
          <ReviewRow label="Registration Number" value={orgValues.registration_number} />
          <ReviewRow label="State" value={orgValues.state_name ?? orgValues.state_id} />
          <ReviewRow label="LGA" value={orgValues.lga_name ?? orgValues.lga_id} />
          <ReviewRow label="Contact Email" value={orgValues.contact_email} />
          <ReviewRow label="Contact Phone" value={orgValues.contact_phone} />
        </ReviewSection>
      )}

      {adminValues && (
        <ReviewSection title="Administrator Account" onEdit={() => onEdit(2)}>
          <ReviewRow label="Full Name" value={adminValues.full_name} />
          <ReviewRow label="Email" value={adminValues.email} />
          <ReviewRow label="Phone" value={adminValues.phone} />
          <ReviewRow label="Password" value="••••••••" />
        </ReviewSection>
      )}

      {apiError && <FormError message={apiError} />}

      <div className="flex gap-3 mt-6">
        <Button type="button" label="Back" variant="secondary" onClick={onBack} />
        <Button
          type="button"
          label="Submit Application"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="text-center py-6">
      <div className="w-14 h-14 rounded-full bg-[#d1fae5] flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-7 h-7 text-[#059669]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-[20px] font-bold text-jet-text mb-2">Application Submitted</h2>
      <p className="text-[14px] text-steel-ink mb-6">
        Your application has been received and is pending review by the National Administrator.
        You will be notified when your account is approved.
      </p>
      <Link to={ROUTES.LOGIN} className="text-[14px] text-royal-navy hover:underline">
        Back to Login
      </Link>
    </div>
  );
}

// ─── Main wizard screen ───────────────────────────────────────────────────────
export default function SubConcessionaireRegister() {
  const {
    currentStep,
    orgCategory,
    orgValues,
    adminValues,
    isSubmitted,
    apiError,
    isLoading,
    setOrgCategory,
    submitOrgValues,
    submitAdminValues,
    goBack,
    goToStep,
    handleFinalSubmit,
  } = useSubconcessionaireRegister();

  const advanceFromOrgType = () => {
    if (orgCategory) goToStep(1);
  };

  return (
    <AuthCard className="max-w-[560px]">
      {isSubmitted ? (
        <SuccessScreen />
      ) : (
        <>
          <div className="mb-8">
            <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />
          </div>

          {currentStep === 0 && (
            <StepOrgType
              selected={orgCategory}
              onSelect={setOrgCategory}
              onNext={advanceFromOrgType}
            />
          )}

          {currentStep === 1 && (
            <StepOrgDetails
              defaultValues={orgValues}
              onNext={submitOrgValues}
              onBack={goBack}
            />
          )}

          {currentStep === 2 && (
            <StepAdminDetails
              defaultValues={adminValues}
              onNext={submitAdminValues}
              onBack={goBack}
            />
          )}

          {currentStep === 3 && (
            <StepReview
              orgCategory={orgCategory}
              orgValues={orgValues}
              adminValues={adminValues}
              apiError={apiError}
              isLoading={isLoading}
              onBack={goBack}
              onEdit={goToStep}
              onSubmit={handleFinalSubmit}
            />
          )}
        </>
      )}
    </AuthCard>
  );
}
