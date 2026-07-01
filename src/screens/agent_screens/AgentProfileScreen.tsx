import StatusBadge from '@/components/StatusBadge/StatusBadge';
import type { AgentProfile } from './services/types';

interface AgentProfileScreenProps {
  profile: AgentProfile | null;
  isLoading: boolean;
  isError: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse max-w-[720px] mx-auto">
      <div className="h-7 bg-[#e5e7eb] rounded w-56 mb-2" />
      <div className="h-4 bg-[#e5e7eb] rounded w-40 mb-8" />
      <div className="bg-white border border-[#c5c6d2] rounded p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-[#e5e7eb] rounded w-24 mb-2" />
              <div className="h-5 bg-[#e5e7eb] rounded w-36" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">{label}</dt>
      <dd className="text-[14px] text-[#1a1b20]">{value}</dd>
    </div>
  );
}

export default function AgentProfileScreen({ profile, isLoading, isError }: AgentProfileScreenProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-[720px] mx-auto">
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-6">
          <p className="text-[14px] text-[#D83B01]">
            Failed to load your agent profile. Please try again or contact support.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-[720px] mx-auto">
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg p-6 text-center">
          <p className="text-[14px] text-[#92400e]">
            Your agent profile has not been set up yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const kycStatus = profile.identity?.kyc_status ?? 'pending';
  const kycStatusVariantMap: Record<string, 'valid' | 'pending' | 'submitted' | 'expired'> = {
    verified: 'valid',
    pending: 'pending',
    submitted: 'submitted',
    rejected: 'expired',
  };
  const kycBadgeVariant = kycStatusVariantMap[kycStatus] ?? 'pending';

  const maskedAccount = profile.bank_account
    ? `****${profile.bank_account.slice(-4)}`
    : '—';

  const floatFormatted = `₦${parseFloat(profile.float_balance).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
  })}`;

  return (
    <div className="max-w-[720px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1a1b20] leading-tight">My Agent Profile</h1>
        <p className="text-[14px] text-[#444650] mt-1">
          Your registered agent information on the TeMS platform.
        </p>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-3 mb-6">
        <StatusBadge
          variant={profile.is_active ? 'valid' : 'cancelled'}
          label={profile.is_active ? 'ACTIVE' : 'INACTIVE'}
        />
        <StatusBadge
          variant={kycBadgeVariant}
          label={`KYC: ${kycStatus.toUpperCase()}`}
        />
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-4">
        <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
          Personal Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow label="First Name" value={profile.first_name ?? '—'} />
          <DetailRow label="Surname" value={profile.last_name ?? '—'} />
          {profile.middle_name && <DetailRow label="Middle Name" value={profile.middle_name} />}
          <DetailRow label="Phone" value={profile.phone ?? '—'} />
          {profile.dob && <DetailRow label="Date of Birth" value={profile.dob} />}
          {profile.address && <DetailRow label="Address" value={profile.address} />}
          {profile.state && <DetailRow label="State" value={profile.state} />}
          {profile.lga && <DetailRow label="LGA" value={profile.lga} />}
        </dl>
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-4">
        <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
          Identity
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow label="TeMS ID" value={profile.identity?.tems_id ?? 'Pending assignment'} />
          <DetailRow
            label="KYC Status"
            value={<StatusBadge variant={kycBadgeVariant} label={kycStatus.toUpperCase()} />}
          />
        </dl>
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-4">
        <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
          Market
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow
            label="Market Name"
            value={profile.market?.name ?? 'No market assigned'}
          />
          {profile.market && (
            <>
              <DetailRow label="Market Code" value={profile.market.code} />
              <DetailRow label="Market Type" value={profile.market.market_type ?? '—'} />
            </>
          )}
        </dl>
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-4">
        <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
          Banking
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow label="Bank Name" value={profile.bank_name ?? '—'} />
          <DetailRow label="Bank Code" value={profile.bank_code ?? '—'} />
          <DetailRow
            label="Account Number"
            value={<span className="font-mono">{maskedAccount}</span>}
          />
        </dl>
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded p-6">
        <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
          Account
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow label="Tier" value={profile.tier} />
          <DetailRow label="Float Balance" value={floatFormatted} />
          <DetailRow
            label="Status"
            value={
              <StatusBadge
                variant={profile.is_active ? 'valid' : 'cancelled'}
                label={profile.is_active ? 'ACTIVE' : 'INACTIVE'}
              />
            }
          />
          <DetailRow label="Device IMEI" value={profile.device_imei ?? '—'} />
        </dl>
      </div>
    </div>
  );
}
