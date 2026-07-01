import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useListPlatformUsersQuery } from './services/userSlice';
import { useGetOrgQuery } from './services/orgSlice';
import {
  useGetAnalyticsSummaryQuery,
  useGetLgaBreakdownQuery,
  useGetStateCorridorsQuery,
  useGetStateMarketsQuery,
} from '@/services/analyticsSlice';
import { useListAuditLogsQuery } from '@/services/auditSlice';

const EVENT_COLORS: Record<string, string> = {
  waybill: '#002366', kyc: '#096c4b', agent: '#6B21A8', system: '#64748b', alert: '#dc2626',
};

function deriveEventType(action: string) {
  const a = action.toLowerCase();
  if (a.includes('waybill'))                           return 'waybill';
  if (a.includes('kyc'))                              return 'kyc';
  if (a.includes('agent'))                            return 'agent';
  if (a.includes('settlement') || a.includes('levy')) return 'system';
  return 'system';
}

function formatRevenue(n: number) {
  if (n >= 1_000_000_000) return '₦' + (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000)     return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)         return '₦' + (n / 1_000).toFixed(0) + 'K';
  return '₦' + n;
}

export default function StateMonitor() {
  const navigate = useNavigate();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Build state org list from StateAdmin users
  const { data: usersData } = useListPlatformUsersQuery({ limit: 200 });
  const stateAdminUsers = (usersData?.data ?? []).filter((u) => u.role_name === 'StateAdmin');
  const seenOrgIds = new Set<string>();
  const stateOrgs = stateAdminUsers.reduce<{ id: string; name: string }[]>((acc, u) => {
    if (u.org_id && !seenOrgIds.has(u.org_id)) {
      seenOrgIds.add(u.org_id);
      acc.push({ id: u.org_id, name: u.org_name ?? u.org_id });
    }
    return acc;
  }, []);

  // Fetch full org data to get state_id
  const { data: orgData } = useGetOrgQuery(selectedOrgId ?? '', { skip: !selectedOrgId });
  const selectedOrg  = stateOrgs.find((o) => o.id === selectedOrgId) ?? null;
  const stateId      = orgData?.data?.state_id;
  const skipState    = !stateId;

  const { data: stateSummary }  = useGetAnalyticsSummaryQuery(
    stateId ? { state_id: stateId, period: 'month' } : undefined,
    { skip: skipState }
  );
  const { data: lgaData }       = useGetLgaBreakdownQuery({ state_id: stateId! }, { skip: skipState });
  const { data: corridorData }  = useGetStateCorridorsQuery({ state_id: stateId!, limit: 6 }, { skip: skipState });
  const { data: marketData }    = useGetStateMarketsQuery({ state_id: stateId!, limit: 5 }, { skip: skipState });
  const { data: auditData }     = useListAuditLogsQuery({ page: 1, limit: 6 });

  const totalWaybills = stateSummary?.data.total_waybills   ?? 0;
  const outbound      = stateSummary?.data.outbound_waybills ?? 0;
  const inbound       = stateSummary?.data.inbound_waybills  ?? 0;
  const totalRevenue  = stateSummary?.data.total_revenue    ?? 0;
  const lgaRows       = lgaData?.data     ?? [];
  const corridors     = corridorData?.data ?? [];
  const markets       = marketData?.data   ?? [];
  const activityLogs  = auditData?.data    ?? [];

  const kpiCards = [
    { label: 'State Revenue (MTD)',    value: formatRevenue(totalRevenue),    color: '#D4AF37' },
    { label: 'Total Waybills (Month)', value: totalWaybills.toLocaleString(), color: '#002366' },
    { label: 'Outbound Volume',        value: outbound.toLocaleString(),      color: '#096c4b' },
    { label: 'Inbound Volume',         value: inbound.toLocaleString(),       color: '#6B21A8' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">State Monitor</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Select any state to view its live trade intelligence dashboard
          </p>
        </div>
        {selectedOrg && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(ROUTES.INCIDENTS)}
              className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors"
            >
              Enforcement Log
            </button>
            <button
              onClick={() => navigate(ROUTES.AUDIT_LOGS)}
              className="bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors"
            >
              Audit Trail
            </button>
          </div>
        )}
      </div>

      {/* ── State Picker ── */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#002366]" />
            <p className="text-[13px] font-semibold text-[#1a1b20]">Select State</p>
          </div>

          <select
            value={selectedOrgId ?? ''}
            onChange={(e) => setSelectedOrgId(e.target.value || null)}
            className="border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] text-[#1a1b20] focus:outline-none focus:ring-2 focus:ring-[#002366]/30 min-w-[220px]"
          >
            <option value="">— Choose a state —</option>
            {stateOrgs.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>

          {stateOrgs.slice(0, 6).map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrgId(selectedOrgId === org.id ? null : org.id)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                selectedOrgId === org.id
                  ? 'bg-[#002366] text-white border-[#002366]'
                  : 'bg-white text-[#1a1b20] border-[#c5c6d2] hover:border-[#002366] hover:text-[#002366]'
              }`}
            >
              {org.name.replace(' State Government', '').replace(' Government', '')}
            </button>
          ))}

          {stateOrgs.length === 0 && (
            <p className="text-[12px] text-[#94a3b8]">
              No state admin accounts found.{' '}
              <button onClick={() => navigate(ROUTES.USER_MANAGEMENT)} className="text-[#002366] font-medium underline">
                Create one →
              </button>
            </p>
          )}

          {selectedOrgId && (
            <button onClick={() => setSelectedOrgId(null)} className="text-[12px] text-[#94a3b8] hover:text-[#dc2626] ml-auto">
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {!selectedOrg && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-16 text-center">
          <div className="w-12 h-12 rounded-full bg-[#e8edf7] flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 rounded-full border-2 border-[#002366]" />
          </div>
          <p className="text-[15px] font-semibold text-[#1a1b20]">No state selected</p>
          <p className="text-[13px] text-[#64748b] mt-1">
            Choose a state above to view its trade intelligence, corridors, and enforcement data.
          </p>
          {stateOrgs.length === 0 && (
            <button
              onClick={() => navigate(ROUTES.USER_MANAGEMENT)}
              className="mt-4 bg-[#002366] text-white text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#001a4d] transition-colors"
            >
              Create State Admin Account
            </button>
          )}
        </div>
      )}

      {/* ── Dashboard (shown when state selected) ── */}
      {selectedOrg && (
        <>
          <div className="flex items-center gap-3 bg-[#e8edf7] border border-[#c5d1ed] rounded-xl px-5 py-3">
            <div className="w-2 h-2 rounded-full bg-[#002366] animate-pulse" />
            <p className="text-[13px] font-semibold text-[#002366]">Viewing: {selectedOrg.name}</p>
            {!stateId && <span className="text-[11px] text-[#dc2626] ml-2">— no state linked to this org</span>}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-[#e2e4ed] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{card.label}</p>
                <p className="text-[26px] font-bold mt-1" style={{ color: card.color }}>
                  {skipState ? '—' : card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Revenue by LGA + Inbound/Outbound */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[14px] font-semibold text-[#1a1b20]">Revenue Breakdown by LGA</p>
                <span className="text-[11px] text-[#64748b] bg-[#f1f3f9] px-2.5 py-1 rounded-full">
                  {selectedOrg.name.replace(' Government', '')} · current month
                </span>
              </div>
              {lgaRows.length === 0 ? (
                <p className="text-[12px] text-[#94a3b8]">{skipState ? 'No state linked.' : 'No LGA data yet.'}</p>
              ) : lgaRows.slice(0, 8).map((row) => (
                <div key={row.lga} className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-medium text-[#64748b] w-32 shrink-0 truncate">{row.lga}</span>
                  <div className="flex-1 h-4 rounded-sm bg-[#f1f3f9] overflow-hidden">
                    <div className="h-full rounded-sm bg-[#002366]" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-mono text-[#1a1b20] w-20 text-right shrink-0">{formatRevenue(row.total_levy)}</span>
                  <span className="text-[10px] text-[#94a3b8] w-12 text-right shrink-0">{row.waybill_count.toLocaleString()} wb</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
              <p className="text-[14px] font-semibold text-[#1a1b20] mb-5">Inbound vs Outbound</p>
              <div className="space-y-4">
                <div className="bg-[#e8edf7] rounded-xl p-4 text-center">
                  <p className="text-[11px] font-semibold text-[#002366] uppercase tracking-wide mb-1">Outbound</p>
                  <p className="text-[32px] font-bold text-[#002366]">{skipState ? '—' : outbound.toLocaleString()}</p>
                  <p className="text-[11px] text-[#64748b] mt-1">waybills leaving state</p>
                </div>
                <div className="bg-[#f3e8ff] rounded-xl p-4 text-center">
                  <p className="text-[11px] font-semibold text-[#6B21A8] uppercase tracking-wide mb-1">Inbound</p>
                  <p className="text-[32px] font-bold text-[#6B21A8]">{skipState ? '—' : inbound.toLocaleString()}</p>
                  <p className="text-[11px] text-[#64748b] mt-1">waybills entering state</p>
                </div>
              </div>
            </div>
          </div>

          {/* Corridors + Markets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
              <p className="text-[14px] font-semibold text-[#1a1b20] mb-4">Border Corridor Status</p>
              {corridors.length === 0 ? (
                <p className="text-[12px] text-[#94a3b8]">{skipState ? 'No state linked.' : 'No corridor data yet.'}</p>
              ) : corridors.map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#f1f3f9] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-[#1a1b20]">{c.origin_state} → {c.destination_state}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${c.direction === 'outbound' ? 'bg-[#e8edf7] text-[#002366]' : 'bg-[#f3e8ff] text-[#6B21A8]'}`}>
                        {c.direction}
                      </span>
                    </div>
                    {c.top_commodity && <p className="text-[11px] text-[#64748b]">{c.top_commodity}</p>}
                  </div>
                  <p className="text-[12px] font-mono font-semibold text-[#1a1b20] shrink-0">{c.waybill_count.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
              <p className="text-[14px] font-semibold text-[#1a1b20] mb-4">High-Traffic Market Activity</p>
              {markets.length === 0 ? (
                <p className="text-[12px] text-[#94a3b8]">{skipState ? 'No state linked.' : 'No market data yet.'}</p>
              ) : markets.map((m, i) => (
                <div key={m.market} className="flex items-center gap-3 py-2 border-b border-[#f1f3f9] last:border-0">
                  <span className="text-[11px] font-mono text-[#94a3b8] w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1a1b20]">{m.market}</p>
                    <p className="text-[11px] text-[#64748b]">{m.origin_lga}{m.top_commodity ? ` · ${m.top_commodity}` : ''}</p>
                  </div>
                  <p className="text-[12px] font-mono font-semibold text-[#1a1b20] shrink-0">{m.waybill_count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-[#1a1b20]">Platform Activity · {selectedOrg.name}</p>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#096c4b]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#096c4b] animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
              {activityLogs.length === 0 ? (
                <p className="text-[12px] text-[#94a3b8]">No recent activity.</p>
              ) : activityLogs.map((ev) => {
                const type = deriveEventType(ev.action);
                const time = new Date(ev.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={ev.id} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: EVENT_COLORS[type] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1a1b20]">{ev.action}</p>
                      <p className="text-[10px] text-[#94a3b8] truncate">{ev.entity_type}{ev.entity_id ? ` · ${ev.entity_id}` : ''}</p>
                    </div>
                    <span className="text-[10px] text-[#94a3b8] shrink-0 font-mono">{time}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => navigate(ROUTES.AUDIT_LOGS)} className="mt-4 text-[12px] text-[#002366] font-medium hover:underline">
              View full audit log →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
