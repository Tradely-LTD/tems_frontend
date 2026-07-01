import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/Buttons';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useIdentityStatus } from './hooks/useIdentityStatus';
import { useGetIdentityProfileQuery } from './services/identitySlice';
import IdentityProfileForm from './IdentityProfileForm';
import IdentityDocumentUpload from './IdentityDocumentUpload';
import { ROLE_NAMES } from '@/config/roles';
import { kycStatusToBadge, DOC_TYPE_LABELS } from './utils/kycUtils';

const IDENTITY_SUBMIT_ROLES: string[] = [ROLE_NAMES.AGENT, ROLE_NAMES.CORPORATE_ACCOUNT, 'Partner'];
const ADMIN_REVIEW_ROLES: string[] = [ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.NATIONAL_ADMIN];

function maskSensitiveValue(value: string | null | undefined, isVerified: boolean): string {
  if (!value) return '—';
  if (isVerified) {
    return '•'.repeat(Math.max(0, value.length - 4)) + value.slice(-4);
  }
  return value;
}

const STEPPER_STEPS = [{ label: 'Identity Details' }, { label: 'Document Type' }];

export default function IdentityDashboard() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  // Lift Step 1 form values so they survive the unmount/remount when navigating to Step 2 and back (AC-15)
  const [savedProfileValues, setSavedProfileValues] = useState<Record<string, string>>({});

  const {
    isLoading,
    hasProfile,
    kycStatus,
    ninVerified,
    tinVerified,
    temsId,
    documents,
    canSubmit,
    refetch,
  } = useIdentityStatus();

  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();

  const { data: profileResponse } = useGetIdentityProfileQuery(undefined, {
    skip: !hasProfile,
  });
  const profile = profileResponse?.data;

  const canSubmitRole = IDENTITY_SUBMIT_ROLES.includes(user?.role_name ?? '');
  const isAdminRole = ADMIN_REVIEW_ROLES.includes(user?.role_name ?? '');

  // Admin roles: redirect to IAM Hub (KYC Review tab) instead of showing the form
  if (isAdminRole) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="bg-[#e8edf7] rounded-full w-14 h-14 flex items-center justify-center">
          <span className="text-[#002366] text-[24px]">⚿</span>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-bold text-[#1a1b20]">KYC Review has moved</p>
          <p className="text-[13px] text-[#64748b] mt-1">
            Agent identity review is now part of the IAM Hub under the KYC Review tab.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/user-management')}
          className="bg-[#002366] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors"
        >
          Open IAM Hub
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#002366]" />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <h1 className="text-[24px] font-bold text-[#1a1b20] mb-1">Identity & KYC</h1>
      <p className="text-[14px] text-[#444650] mb-8">
        Verify your identity to access full platform features.
      </p>

      {step === 0 && (
        <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-6">
          {!hasProfile ? (
            <>
              <p className="text-[14px] text-[#444650] mb-4">
                No KYC profile found. Submit your identity to get started.
              </p>
              {canSubmitRole && (
                <Button
                  label="Get Started"
                  variant="primary"
                  onClick={() => setStep(1)}
                />
              )}
            </>
          ) : (
            <>
              {/* Status row */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[13px] font-semibold text-[#444650] uppercase tracking-wide">
                  KYC Status
                </span>
                {kycStatus && (
                  <StatusBadge
                    variant={kycStatusToBadge(kycStatus)}
                    label={kycStatus.toUpperCase()}
                  />
                )}
              </div>

              {/* Definition grid */}
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                    NIN Verified
                  </dt>
                  <dd className={`text-[14px] ${ninVerified ? 'text-[#096c4b]' : 'text-[#ba1a1a]'}`}>
                    {ninVerified ? '✓ Verified' : '✗ Not verified'}
                  </dd>
                </div>

                <div className="flex flex-col gap-0.5">
                  <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                    TIN Verified
                  </dt>
                  <dd className={`text-[14px] ${tinVerified ? 'text-[#096c4b]' : 'text-[#ba1a1a]'}`}>
                    {tinVerified ? '✓ Verified' : '✗ Not verified'}
                  </dd>
                </div>

                <div className="flex flex-col gap-0.5">
                  <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                    TeMS ID
                  </dt>
                  <dd className="text-[14px] text-[#1a1b20] font-mono">
                    {temsId ?? 'Pending assignment'}
                  </dd>
                </div>

                <div className="flex flex-col gap-0.5">
                  <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                    Date of Birth
                  </dt>
                  <dd className="text-[14px] text-[#1a1b20]">
                    {profile?.date_of_birth ?? '—'}
                  </dd>
                </div>

                <div className="flex flex-col gap-0.5 col-span-2">
                  <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                    Address
                  </dt>
                  <dd className="text-[14px] text-[#1a1b20]">
                    {profile?.address ?? '—'}
                  </dd>
                </div>

                <div className="flex flex-col gap-0.5">
                  <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                    NIN
                  </dt>
                  <dd className="text-[14px] text-[#1a1b20] font-mono">
                    {maskSensitiveValue(profile?.nin, ninVerified)}
                  </dd>
                </div>

                <div className="flex flex-col gap-0.5">
                  <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                    TIN
                  </dt>
                  <dd className="text-[14px] text-[#1a1b20] font-mono">
                    {maskSensitiveValue(profile?.tin, tinVerified)}
                  </dd>
                </div>

                <div className="flex flex-col gap-0.5">
                  <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                    BVN
                  </dt>
                  <dd className="text-[14px] text-[#1a1b20] font-mono">
                    {maskSensitiveValue(profile?.bvn, ninVerified && tinVerified)}
                  </dd>
                </div>
              </dl>

              {/* Documents section */}
              <div className="mt-6">
                <h3 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-3">
                  Documents Submitted
                </h3>
                {documents.length === 0 ? (
                  <p className="text-[14px] text-[#444650]">No documents uploaded yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between py-2 border-b border-[#f4f3f9] last:border-0"
                      >
                        <span className="text-[14px] text-[#1a1b20]">
                          {DOC_TYPE_LABELS[doc.id_type] ?? doc.id_type}
                          {doc.is_primary && (
                            <span className="ml-2 text-[11px] font-bold text-[#002366] bg-[#f4f3f9] px-1.5 py-0.5 rounded uppercase">
                              Primary
                            </span>
                          )}
                        </span>
                        <span className="text-[12px] text-[#444650]">
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resubmit button */}
              {canSubmitRole && canSubmit && (
                <Button
                  label="Resubmit / Update"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="mt-4"
                />
              )}
            </>
          )}
        </div>
      )}

      {/* AC-14: Step sequencing is enforced by the onSuccess callback chain.
          The Stepper component is purely visual (no onClick handlers), so users
          cannot click through to Step 2 — it is only reachable after IdentityProfileForm
          calls onSuccess(), which the hook only invokes after a successful API response. */}
      {step === 1 && (
        <>
          {kycStatus === 'rejected' && (
            <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4 text-[13px] text-amber-800">
              Your previous submission was rejected. Please review your details and resubmit.
            </div>
          )}
          <Stepper steps={STEPPER_STEPS} currentStep={0} />
          <div className="mt-6">
            <IdentityProfileForm
              onSuccess={() => setStep(2)}
              onBack={() => setStep(0)}
              hasProfile={hasProfile}
              savedValues={savedProfileValues}
              onValuesChange={setSavedProfileValues}
            />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Stepper steps={STEPPER_STEPS} currentStep={1} />
          <div className="mt-6">
            <IdentityDocumentUpload
              onSuccess={() => {
                refetch();
                setStep(0);
              }}
              onBack={() => setStep(1)}
            />
          </div>
        </>
      )}
    </div>
  );
}
