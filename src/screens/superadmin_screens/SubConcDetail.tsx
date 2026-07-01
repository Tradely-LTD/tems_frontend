/**
 * @module superadmin_screens
 * @depends services/orgSlice, agent_screens/services/agentSlice, services/analyticsSlice
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrgQuery, useUpdateOrgMutation } from './services/orgSlice';
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';
import { ROUTES } from '@/constants/routes';

export default function SubConcDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analyticsTab, setAnalyticsTab] = useState<'today' | 'week' | 'month'>('month');

  const { data: orgData, isLoading: orgLoading, isError: orgError } = useGetOrgQuery(id ?? '');
  const { data: agentsData, isLoading: agentsLoading } = useGetAgentsQuery(id ? { org_id: id, limit: 200 } : undefined);
  const { data: analyticsData, isLoading: analyticsLoading } = useGetAnalyticsSummaryQuery(
    id ? { period: analyticsTab, org_id: id } : undefined,
    { skip: !id }
  );
  const [updateOrg, { isLoading: updating }] = useUpdateOrgMutation();

  if (!id) return null;

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-[#94a3b8] text-[13px]">Loading…</p>
      </div>
    );
  }

  if (orgError || !orgData?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-[#dc2626] text-[13px]">Organisation not found.</p>
        <button
          onClick={() => navigate(ROUTES.SUBCONC_MANAGEMENT)}
          className="text-[12px] text-[#002366] hover:underline"
        >
          ← Back to management
        </button>
      </div>
    );
  }

  const org = orgData.data;
  const agents = agentsData?.data ?? [];
  const activeAgents   = agents.filter((a) => a.is_active);
  const inactiveAgents = agents.filter((a) => !a.is_active);

  const ALL_MODULES = ['Analytics', 'Compliance', 'Settlements', 'Audit Logs', 'Intelligence'];
  const enabledModules: string[] = org.metadata?.enabled_modules ?? ALL_MODULES;

  async function toggleStatus() {
    await updateOrg({ id: org.id, body: { is_active: !org.is_active } });
  }

  async function toggleModule(module: string) {
    const next = enabledModules.includes(module)
      ? enabledModules.filter((m) => m !== module)
      : [...enabledModules, module];
    await updateOrg({ id: org.id, body: { enabled_modules: next } });
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(ROUTES.SUBCONC_MANAGEMENT)}
          className="mt-1 text-[#64748b] hover:text-[#1a1b20] text-[12px] flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-[#1a1b20]">{org.name}</h1>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={org.is_active
                ? { backgroundColor: '#e6f4ef', color: '#096c4b' }
                : { backgroundColor: '#fee2e2', color: '#b91c1c' }
              }
            >
              {org.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-[13px] text-[#64748b] mt-0.5 font-mono">{org.slug}</p>
        </div>
        <button
          onClick={toggleStatus}
          disabled={updating}
          className={`text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
            org.is_active
              ? 'bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]'
              : 'bg-[#e6f4ef] text-[#096c4b] hover:bg-[#d1fae5]'
          }`}
        >
          {updating ? '…' : org.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      {/* Org info + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Org card */}
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-5 space-y-4">
          <p className="text-[13px] font-semibold text-[#1a1b20]">Organisation Info</p>
          <div className="space-y-3 text-[12px]">
            {[
              ['Type',         org.org_type.replace(/_/g, ' ')],
              ['Contact Email', org.contact_email ?? '—'],
              ['Contact Phone', org.contact_phone ?? '—'],
              ['Reg. Number',  org.registration_number ?? '—'],
              ['Category',     org.org_category ?? '—'],
              ['Created',      new Date(org.created_at).toLocaleDateString('en-GB')],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start gap-2">
                <span className="text-[#94a3b8] shrink-0">{label}</span>
                <span className="text-[#1a1b20] font-medium text-right capitalize break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs + analytics */}
        <div className="lg:col-span-2 space-y-4">
          {/* Period selector */}
          <div className="flex gap-1.5">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button key={p} onClick={() => setAnalyticsTab(p)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  analyticsTab === p ? 'bg-[#002366] text-white' : 'bg-white border border-[#c5c6d2] text-[#64748b] hover:border-[#435b9f]'
                }`}>
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Agents',    value: agents.length,          color: '#002366', bg: '#e8edf7' },
            { label: 'Active Agents',   value: activeAgents.length,   color: '#096c4b', bg: '#e6f4ef' },
            { label: 'Inactive Agents', value: inactiveAgents.length, color: '#94a3b8', bg: '#f1f3f9' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-[#e2e4ed] p-5" style={{ backgroundColor: k.bg }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{k.label}</p>
              <p className="text-[32px] font-bold mt-1" style={{ color: k.color }}>
                {agentsLoading ? '…' : k.value}
              </p>
            </div>
          ))}
          {/* Revenue KPIs */}
          {analyticsLoading ? (
            <div className="col-span-3 py-4 text-center text-[#94a3b8] text-[12px]">Loading analytics…</div>
          ) : analyticsData?.data ? (
            <>
              <div className="rounded-xl border border-[#e2e4ed] p-4" style={{ backgroundColor: '#e8edf7' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Platform Revenue</p>
                <p className="text-[26px] font-bold mt-1 text-[#002366]">
                  ₦{analyticsData.data.total_revenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#64748b] mt-0.5 capitalize">{analyticsData.data.period}</p>
              </div>
              <div className="col-span-2 rounded-xl border border-[#e2e4ed] p-4 bg-white">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b] mb-2">Waybill Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analyticsData.data.by_status).map(([status, count]) => (
                    <span key={status} className="text-[11px] px-2.5 py-1 rounded-full bg-[#f1f3f9] text-[#1a1b20] font-medium capitalize">
                      {status.replace(/_/g, ' ')}: <strong>{count}</strong>
                    </span>
                  ))}
                  {Object.keys(analyticsData.data.by_status).length === 0 && (
                    <span className="text-[12px] text-[#94a3b8]">No waybill activity in this period.</span>
                  )}
                </div>
              </div>
            </>
          ) : null}
          </div>
        </div>

      </div>

      {/* Module toggles */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
        <div className="mb-4">
          <p className="text-[14px] font-semibold text-[#1a1b20]">Module Access</p>
          <p className="text-[12px] text-[#64748b] mt-0.5">Toggle modules on or off for this sub-concessionaire. Disabled modules are hidden from their dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {ALL_MODULES.map((mod) => {
            const active = enabledModules.includes(mod);
            return (
              <button
                key={mod}
                onClick={() => toggleModule(mod)}
                disabled={updating}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-semibold transition-all disabled:opacity-60 ${
                  active
                    ? 'bg-[#e6f4ef] border-[#096c4b] text-[#096c4b] hover:bg-[#d1fae5]'
                    : 'bg-[#f8f9fc] border-[#c5c6d2] text-[#94a3b8] hover:bg-[#f1f3f9]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#096c4b]' : 'bg-[#c5c6d2]'}`} />
                {mod}
                <span className="text-[10px] font-normal ml-1">{active ? 'On' : 'Off'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent table */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
          <p className="text-[14px] font-semibold text-[#1a1b20]">Agents ({agents.length})</p>
        </div>
        {agentsLoading ? (
          <div className="py-10 text-center text-[#94a3b8] text-[13px]">Loading agents…</div>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                <th className="text-left font-semibold text-[#64748b] px-5 py-3">Agent</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Phone</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Tier</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Float Balance</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Status</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd]">
                  <td className="px-5 py-3 font-medium text-[#1a1b20]">
                    {agent.first_name} {agent.last_name}
                  </td>
                  <td className="px-4 py-3 text-[#64748b] font-mono">{agent.phone}</td>
                  <td className="px-4 py-3 text-[#64748b]">Tier {agent.tier}</td>
                  <td className="px-4 py-3 font-semibold text-[#1a1b20]">
                    ₦{Number(agent.float_balance ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={agent.is_active
                        ? { backgroundColor: '#e6f4ef', color: '#096c4b' }
                        : { backgroundColor: '#f1f3f9', color: '#94a3b8' }
                      }
                    >
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#94a3b8]">
                    {new Date(agent.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#94a3b8]">
                    No agents registered for this organisation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
