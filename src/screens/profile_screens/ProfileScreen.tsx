import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useProfile } from './hooks/useProfile';
import { updateProfileSchema } from './schema/profileValidationSchema';
import type { UpdateProfileFormValues } from './schema/profileValidationSchema';
import { ROUTES } from '@/constants/routes';

function VerifiedBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#9ff4c9] text-[#065f46]">
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[rgba(186,26,26,0.12)] text-[#ba1a1a]">
      Unverified
    </span>
  );
}

function SpinnerIcon() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-[#002366] border-t-transparent" aria-label="Loading" />
    </div>
  );
}

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#444650] mb-1">{label}</label>
      <div className="px-3 py-2.5 rounded-lg bg-[#f1f2f8] border border-[#c5c6d2] text-[14px] text-[#1a1b20]">
        {value || <span className="text-[#94a3b8]">—</span>}
      </div>
      {hint && <p className="text-[11px] text-[#94a3b8] mt-1">{hint}</p>}
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4 text-[#758dd5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default function ProfileScreen() {
  const { profile, isLoading, error, handleUpdate, isUpdating, updateError } = useProfile();
  const [editingName, setEditingName] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: yupResolver(updateProfileSchema),
    defaultValues: { full_name: profile?.data?.full_name ?? '' },
  });

  if (isLoading) return <SpinnerIcon />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.2)] rounded-xl px-4 py-3 text-[#ba1a1a] text-[13px]">
          Failed to load profile. Please refresh the page.
        </div>
      </div>
    );
  }

  const data = profile?.data;
  if (!data) return null;

  async function onSubmit(values: UpdateProfileFormValues) {
    setSaveSuccess(false);
    const result = await handleUpdate(values);
    if (result) {
      setSaveSuccess(true);
      setEditingName(false);
    }
  }

  function handleEditClick() {
    reset({ full_name: data!.full_name });
    setEditingName(true);
    setSaveSuccess(false);
  }

  function handleCancelEdit() {
    reset({ full_name: data!.full_name });
    setEditingName(false);
    setSaveSuccess(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A]">My Profile</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Manage your account information and security settings.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-[#e2e4ed] shadow-sm overflow-hidden">
        {/* Avatar + name section */}
        <div className="px-6 pt-6 pb-5 border-b border-[#e2e4ed] flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[#002366] flex items-center justify-center shrink-0">
            <span className="text-white text-[18px] font-bold">
              {data.full_name
                ? data.full_name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')
                : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <div>
                  <input
                    {...register('full_name')}
                    type="text"
                    aria-label="Full name"
                    className="w-full px-3 py-2 rounded-lg border border-[#002366] text-[14px] text-[#1a1b20] focus:outline-none focus:ring-2 focus:ring-[#002366]/20"
                    autoFocus
                  />
                  {errors.full_name && (
                    <p className="text-[11px] text-[#ba1a1a] mt-0.5">{errors.full_name.message}</p>
                  )}
                  {updateError && (
                    <p className="text-[11px] text-[#ba1a1a] mt-0.5">{updateError}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-1.5 rounded-lg bg-[#002366] text-white text-[12px] font-medium hover:bg-[#00113a] transition-colors disabled:opacity-60"
                  >
                    {isUpdating ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-1.5 rounded-lg border border-[#c5c6d2] text-[#444650] text-[12px] font-medium hover:bg-[#f1f2f8] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[18px] font-semibold text-[#0F172A] leading-tight">{data.full_name}</p>
                  <p className="text-[13px] text-[#758dd5] mt-0.5">{data.role_name}</p>
                </div>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="ml-auto text-[12px] text-[#002366] font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
            {saveSuccess && (
              <p className="text-[12px] text-[#065f46] mt-1">Name updated successfully.</p>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-4">
          {/* Email with badge */}
          <div>
            <label className="block text-[12px] font-medium text-[#444650] mb-1">Email address</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#f1f2f8] border border-[#c5c6d2]">
              <span className="flex-1 text-[14px] text-[#1a1b20]">{data.email}</span>
              <VerifiedBadge verified={data.email_verified} />
            </div>
          </div>

          <ReadOnlyField
            label="Phone number"
            value={data.phone}
            hint="Contact support to change your phone number."
          />

          <ReadOnlyField label="Role" value={data.role_name} />

          <ReadOnlyField
            label="Status"
            value={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          />

          {data.last_login_at && (
            <ReadOnlyField
              label="Last login"
              value={new Date(data.last_login_at).toLocaleString()}
            />
          )}
        </div>
      </div>

      {/* Security links */}
      <div className="bg-white rounded-2xl border border-[#e2e4ed] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e4ed]">
          <h2 className="text-[14px] font-semibold text-[#0F172A]">Security</h2>
        </div>
        <div className="divide-y divide-[#e2e4ed]">
          <Link
            to={ROUTES.PROFILE_CHANGE_PASSWORD}
            className="flex items-center justify-between px-6 py-4 hover:bg-[#faf8ff] transition-colors"
          >
            <div>
              <p className="text-[13px] font-medium text-[#1a1b20]">Change password</p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">Update your account password</p>
            </div>
            <ChevronRightIcon />
          </Link>
          <Link
            to={ROUTES.PROFILE_CHANGE_EMAIL}
            className="flex items-center justify-between px-6 py-4 hover:bg-[#faf8ff] transition-colors"
          >
            <div>
              <p className="text-[13px] font-medium text-[#1a1b20]">Change email address</p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">Update the email associated with your account</p>
            </div>
            <ChevronRightIcon />
          </Link>
          <Link
            to={ROUTES.PROFILE_SETTINGS}
            className="flex items-center justify-between px-6 py-4 hover:bg-[#faf8ff] transition-colors"
          >
            <div>
              <p className="text-[13px] font-medium text-[#1a1b20]">Preferences &amp; settings</p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">Notifications, theme, and other preferences</p>
            </div>
            <ChevronRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
