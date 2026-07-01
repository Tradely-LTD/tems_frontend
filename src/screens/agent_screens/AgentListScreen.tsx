import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { Button } from '@/components/Buttons';
import { ROUTES, buildAgentDetailRoute } from '@/constants/routes';
import { useAgentList } from './hooks/useAgentList';
import type { AgentRecord } from './services/types';

const MANAGE_ROLES = ['MarketAdmin', 'SubConcessionaireAdmin', 'NationalAdmin', 'SuperAdmin'];

type ActiveFilter = 'all' | 'active' | 'inactive';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-[#f4f3f9]">
          <div className="h-4 bg-[#e5e7eb] rounded w-40" />
          <div className="h-4 bg-[#e5e7eb] rounded w-32" />
          <div className="h-4 bg-[#e5e7eb] rounded w-16" />
          <div className="h-6 bg-[#e5e7eb] rounded w-20" />
          <div className="h-4 bg-[#e5e7eb] rounded w-24 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export default function AgentListScreen() {
  const navigate = useNavigate();
  const roleName = useAppSelector((s) => s.auth.user?.role_name);
  const canManage = roleName ? MANAGE_ROLES.includes(roleName) : false;

  const {
    agents,
    isLoading,
    isError,
    refetch,
    activeFilter,
    setActiveFilter,
  } = useAgentList();

  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1b20] leading-tight">Agents</h1>
          <p className="text-[14px] text-[#444650] mt-1">
            Manage registered trade agents.
          </p>
        </div>
        {canManage && (
          <Button
            label="Onboard New Agent"
            variant="primary"
            onClick={() => navigate(ROUTES.AGENTS_NEW)}
          />
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[12px] font-semibold text-[#444650] uppercase tracking-wide mr-1">
          Show:
        </span>
        {(['all', 'active', 'inactive'] as ActiveFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`h-8 px-4 text-[12px] font-medium rounded border transition-colors ${
              activeFilter === filter
                ? 'bg-[#002366] text-white border-[#002366]'
                : 'border-[#c5c6d2] text-[#444650] hover:border-[#002366]'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-5 flex items-center justify-between">
          <p className="text-[14px] text-[#D83B01]">
            Failed to load agents. Please try again.
          </p>
          <Button label="Retry" variant="secondary" onClick={refetch} />
        </div>
      )}

      {/* Table */}
      {!isError && (
        <div className="bg-white border border-[#c5c6d2] rounded overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_80px_100px_120px_80px] gap-4 px-4 py-3 bg-[#f4f3f9] border-b border-[#c5c6d2]">
            <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#444650]">Agent Name</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#444650]">Phone</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#444650]">Tier</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#444650]">Status</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#444650]">Created</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#444650]"></span>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="p-4">
              <LoadingSkeleton />
            </div>
          )}

          {/* Rows */}
          {!isLoading && agents?.data && agents.data.length > 0 && (
            <div>
              {agents.data.map((agent: AgentRecord) => (
                <div
                  key={agent.id}
                  className="grid grid-cols-[1fr_1fr_80px_100px_120px_80px] gap-4 px-4 py-3 border-b border-[#f4f3f9] last:border-0 items-center hover:bg-[#fafafa] transition-colors"
                >
                  <span className="text-[13px] text-[#1a1b20] truncate">
                    {`${agent.first_name ?? ''} ${agent.last_name ?? ''}`.trim() || '—'}
                  </span>
                  <span className="text-[13px] text-[#444650] truncate">
                    {agent.phone ?? '—'}
                  </span>
                  <span className="text-[13px] text-[#1a1b20]">{agent.tier}</span>
                  <StatusBadge
                    variant={agent.is_active ? 'valid' : 'cancelled'}
                    label={agent.is_active ? 'ACTIVE' : 'INACTIVE'}
                  />
                  <span className="text-[12px] text-[#444650]">
                    {new Date(agent.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                  </span>
                  <button
                    onClick={() => navigate(buildAgentDetailRoute(agent.id))}
                    className="text-[12px] font-medium text-[#002366] hover:underline"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!agents?.data || agents.data.length === 0) && !isError && (
            <div className="py-16 text-center">
              <p className="text-[14px] text-[#444650]">No agents found.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination info */}
      {agents?.meta && (
        <div className="mt-3 text-[12px] text-[#444650] text-right">
          {agents.meta.total} total agent{agents.meta.total !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
