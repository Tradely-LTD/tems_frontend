import { useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { Button } from '@/components/Buttons';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAgentDetail } from './hooks/useAgentDetail';

const MANAGE_ROLES = ['MarketAdmin', 'SubConcessionaireAdmin', 'NationalAdmin', 'SuperAdmin'];

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-[#e5e7eb] rounded w-64 mb-2" />
      <div className="h-4 bg-[#e5e7eb] rounded w-40 mb-8" />
      <div className="bg-white border border-[#c5c6d2] rounded p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-[#e5e7eb] rounded w-24 mb-2" />
              <div className="h-5 bg-[#e5e7eb] rounded w-40" />
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

export default function AgentDetailScreen() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();
  const roleName = useAppSelector((s) => s.auth.user?.role_name);
  const canManage = roleName ? MANAGE_ROLES.includes(roleName) : false;
  const { data: agent, isLoading, isError, refetch, handleToggleStatus, isToggling, toggleError } = useAgentDetail(agentId ?? '');

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto">
        <LoadingSkeleton />
      </div>
    );
  }

  if (isError || !agent) {
    return (
      <div className="max-w-[900px] mx-auto">
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-6 flex flex-col gap-4 items-start">
          <p className="text-[14px] text-[#D83B01]">
            {isError ? 'Failed to load agent profile. Please try again.' : 'Agent not found.'}
          </p>
          <div className="flex gap-3">
            <Button label="Retry" variant="secondary" onClick={refetch} />
            <Button label="Go Back" variant="ghost" onClick={() => navigate(-1)} />
          </div>
        </div>
      </div>
    );
  }

  const kycStatusVariantMap: Record<string, 'valid' | 'pending' | 'submitted' | 'expired'> = {
    verified: 'valid',
    pending: 'pending',
    submitted: 'submitted',
    rejected: 'expired',
  };

  const kycStatus = agent.identity?.kyc_status ?? 'pending';
  const kycBadgeVariant = kycStatusVariantMap[kycStatus] ?? 'pending';

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1b20] leading-tight">Agent Profile</h1>
          <p className="text-[13px] text-[#444650] mt-1">
            {`${agent.first_name ?? ''} ${agent.last_name ?? ''}`.trim() || 'Agent'}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {canManage && (
            <div className="flex gap-3">
              {agent.is_active ? (
                <Button
                  label="Suspend Agent"
                  variant="secondary"
                  onClick={handleToggleStatus}
                  loading={isToggling}
                  disabled={isToggling}
                />
              ) : (
                <Button
                  label="Activate Agent"
                  variant="primary"
                  onClick={handleToggleStatus}
                  loading={isToggling}
                  disabled={isToggling}
                />
              )}
            </div>
          )}
          <Button label="Go Back" variant="ghost" onClick={() => navigate(-1)} />
        </div>
      </div>
      {toggleError && <p className="text-red-500 text-sm mb-4">{toggleError}</p>}

      {/* Status banner */}
      <div className="flex items-center gap-3 mb-6">
        <StatusBadge
          variant={agent.is_active ? 'valid' : 'cancelled'}
          label={agent.is_active ? 'ACTIVE' : 'INACTIVE'}
        />
        <StatusBadge
          variant={kycBadgeVariant}
          label={`KYC: ${kycStatus.toUpperCase()}`}
        />
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-4">
        <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
          Agent Information
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow label="TeMS ID" value={agent.identity?.tems_id ?? 'Pending assignment'} />
          <DetailRow
            label="Full Name"
            value={`${agent.first_name ?? ''} ${agent.last_name ?? ''}`.trim() || '—'}
          />
          <DetailRow label="Email" value={agent.email ?? '—'} />
          <DetailRow label="Phone" value={agent.phone ?? '—'} />
          <DetailRow label="Tier" value={agent.tier} />
          <DetailRow label="Float Balance" value={`₦${parseFloat(agent.float_balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`} />
          <DetailRow label="Device IMEI" value={agent.device_imei ?? '—'} />
          <DetailRow
            label="Status"
            value={
              <StatusBadge
                variant={agent.is_active ? 'valid' : 'cancelled'}
                label={agent.is_active ? 'ACTIVE' : 'INACTIVE'}
              />
            }
          />
          <DetailRow
            label="Created"
            value={new Date(agent.created_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}
          />
          <DetailRow
            label="Last Updated"
            value={new Date(agent.updated_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}
          />
        </dl>
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-4">
        <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
          Banking Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow label="Bank Name" value={agent.bank_name ?? '—'} />
          <DetailRow label="Bank Code" value={agent.bank_code ?? '—'} />
          <DetailRow
            label="Account Number"
            value={
              agent.bank_account
                ? <span className="font-mono">{`••••••${agent.bank_account.slice(-4)}`}</span>
                : '—'
            }
          />
        </dl>
      </div>

      {agent.market && (
        <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-4">
          <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
            Market
          </h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailRow label="Market Name" value={agent.market.name} />
            <DetailRow label="Market Code" value={agent.market.code} />
            <DetailRow label="Market Type" value={agent.market.market_type ?? '—'} />
          </dl>
        </div>
      )}

      <div className="bg-white border border-[#c5c6d2] rounded p-6">
        <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-4">
          KYC / Identity
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow
            label="KYC Status"
            value={<StatusBadge variant={kycBadgeVariant} label={kycStatus.toUpperCase()} />}
          />
          <DetailRow label="TeMS ID" value={agent.identity?.tems_id ?? 'Pending assignment'} />
        </dl>
      </div>
    </div>
  );
}
