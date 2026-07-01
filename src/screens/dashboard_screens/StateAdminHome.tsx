import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import {
  useGetAnalyticsSummaryQuery,
  useGetLgaBreakdownQuery,
  useGetStateCorridorsQuery,
  useGetStateMarketsQuery,
} from '@/services/analyticsSlice';
import { useListAuditLogsQuery } from '@/services/auditSlice';
import { useGetOrgQuery } from '@/screens/superadmin_screens/services/orgSlice';

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

const CORRIDOR_STATUS_STYLES = {
  open:    'bg-[#e6f4ef] text-[#096c4b]',
  flagged: 'bg-[#fef2f2] text-[#dc2626]',
  closed:  'bg-[#f1f3f9] text-[#64748b]',
} as const;

const MARKET_STATUS_STYLES = {
  busy:   'bg-[#fdf8e3] text-[#92400e]',
  normal: 'bg-[#e6f4ef] text-[#096c4b]',
  closed: 'bg-[#f1f3f9] text-[#64748b]',
} as const;

export default function StateAdminHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: orgData }    = useGetOrgQuery(user?.org_id ?? '', { skip: !user?.org_id });
  const orgName  = orgData?.data?.name ?? 'State Government';
  const stateId  = orgData?.data?.state_id;

  const skipState = !stateId;

  const { data: stateSummary } = useGetAnalyticsSummaryQuery(
    stateId ? { state_id: stateId, period: 'month' } : undefined,
    { skip: skipState }
  );
  const { data: weekStateSummary } = useGetAnalyticsSummaryQuery(
    stateId ? { state_id: stateId, period: 'week' } : undefined,
    { skip: skipState }
  );
  const { data: lgaData }      = useGetLgaBreakdownQuery({ state_id: stateId! }, { skip: skipState });
  const { data: corridorData } = useGetStateCorridorsQuery({ state_id: stateId!, limit: 6 }, { skip: skipState });
  const { data: marketData }   = useGetStateMarketsQuery({ state_id: stateId!, limit: 5 }, { skip: skipState });
  const { data: auditData }    = useListAuditLogsQuery({ page: 1, limit: 6 });

  const totalWaybills  = stateSummary?.data.total_waybills   ?? 0;
  const outbound       = stateSummary?.data.outbound_waybills ?? 0;
  const inbound        = stateSummary?.data.inbound_waybills  ?? 0;
  const weekWaybills   = weekStateSummary?.data.total_waybills ?? 0;
  const totalRevenue   = stateSummary?.data.total_revenue    ?? 0;
  const activityLogs   = auditData?.data ?? [];

  const lgaRows     = lgaData?.data     ?? [];
  const corridors   = corridorData?.data ?? [];
  const markets     = marketData?.data   ?? [];

  const kpiCards = [
    { label: 'State Revenue (MTD)',    value: formatRevenue(totalRevenue),    delta: 'Month to date',               color: '#D4AF37' },
    { label: 'Total Waybills (Month)', value: totalWaybills.toLocaleString(), delta: `+${weekWaybills} this week`,  color: '#002366' },
    { label: 'Outbound Volume',        value: outbound.toLocaleString(),      delta: 'Waybills leaving state (MTD)', color: '#096c4b' },
    { label: 'Inbound Volume',         value: inbound.toLocaleString(),       delta: 'Waybills entering state (MTD)',color: '#6B21A8' },
    { label: 'Enforcement Actions',    value: '—',                            delta: 'Coming soon',                 color: '#dc2626' },
    { label: 'Active Checkpoints',     value: '—',                            delta: 'Coming soon',                 color: '#64748b' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#002366] bg-[#e8edf7] px-2.5 py-0.5 rounded-full">
              {orgName}
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Trade Intelligence Dashboard</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Welcome, {firstName} — revenue, enforcement, corridors, and market activity
          </p>
        </div>
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
      </div>

      {/* ── No state linked warning ── */}
      {!stateId && orgData && (
        <div className="bg-[#fdf8e3] border border-[#fde68a] rounded-xl p-4 text-[13px] text-[#92400e]">
          This organisation has no state linked. Ask a SuperAdmin to set the state on your account.
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#e2e4ed] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b] leading-tight">{card.label}</p>
            <p className="text-[22px] font-bold mt-1 leading-none" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[10px] text-[#64748b] mt-1">{card.delta}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue by LGA + Inbound vs Outbound ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Revenue Breakdown by LGA</p>
            <span className="text-[11px] text-[#64748b] bg-[#f1f3f9] px-2.5 py-1 rounded-full">Current month · levy collected</span>
          </div>
          {lgaRows.length === 0 ? (
            <p className="text-[12px] text-[#94a3b8]">{skipState ? 'No state linked.' : 'No data yet for this period.'}</p>
          ) : (
            <div className="space-y-3">
              {lgaRows.slice(0, 8).map((row) => (
                <div key={row.lga} className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-[#64748b] w-32 shrink-0 truncate">{row.lga}</span>
                  <div className="flex-1 h-4 rounded-sm bg-[#f1f3f9] overflow-hidden">
                    <div className="h-full rounded-sm bg-[#002366] transition-all" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-mono text-[#1a1b20] w-20 text-right shrink-0">{formatRevenue(row.total_levy)}</span>
                  <span className="text-[10px] text-[#94a3b8] w-12 text-right shrink-0">{row.waybill_count.toLocaleString()} wb</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[14px] font-semibold text-[#1a1b20] mb-5">Inbound vs Outbound</p>
          <div className="space-y-4">
            <div className="bg-[#e8edf7] rounded-xl p-4 text-center">
              <p className="text-[11px] font-semibold text-[#002366] uppercase tracking-wide mb-1">Outbound</p>
              <p className="text-[32px] font-bold text-[#002366]">{outbound.toLocaleString()}</p>
              <p className="text-[11px] text-[#64748b] mt-1">waybills leaving state</p>
            </div>
            <div className="bg-[#f3e8ff] rounded-xl p-4 text-center">
              <p className="text-[11px] font-semibold text-[#6B21A8] uppercase tracking-wide mb-1">Inbound</p>
              <p className="text-[32px] font-bold text-[#6B21A8]">{inbound.toLocaleString()}</p>
              <p className="text-[11px] text-[#64748b] mt-1">waybills entering state</p>
            </div>
            {(outbound + inbound) > 0 && (
              <div className="border-t border-[#f1f3f9] pt-3 text-center">
                <p className="text-[11px] text-[#64748b]">
                  Net: <span className="font-bold text-[#002366]">
                    {outbound >= inbound ? `+${(outbound - inbound).toLocaleString()} outbound` : `+${(inbound - outbound).toLocaleString()} inbound`}
                  </span> surplus
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Border Corridors + Markets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Border Corridor Status</p>
            <button onClick={() => navigate(ROUTES.WAYBILLS)} className="text-[12px] text-[#002366] font-medium hover:underline">
              View all →
            </button>
          </div>
          {corridors.length === 0 ? (
            <p className="text-[12px] text-[#94a3b8]">{skipState ? 'No state linked.' : 'No corridor data yet.'}</p>
          ) : (
            <div className="space-y-2">
              {corridors.map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#f1f3f9] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-[#1a1b20]">{c.origin_state} → {c.destination_state}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${c.direction === 'outbound' ? 'bg-[#e8edf7] text-[#002366]' : 'bg-[#f3e8ff] text-[#6B21A8]'}`}>
                        {c.direction}
                      </span>
                    </div>
                    {c.top_commodity && <p className="text-[11px] text-[#64748b] mt-0.5">{c.top_commodity}</p>}
                  </div>
                  <p className="text-[12px] font-mono font-semibold text-[#1a1b20] shrink-0">{c.waybill_count.toLocaleString()}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${CORRIDOR_STATUS_STYLES['open']}`}>
                    open
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-[#1a1b20]">High-Traffic Market Activity</p>
            <span className="text-[11px] text-[#64748b] bg-[#f1f3f9] px-2.5 py-1 rounded-full">Top markets by volume</span>
          </div>
          {markets.length === 0 ? (
            <p className="text-[12px] text-[#94a3b8]">{skipState ? 'No state linked.' : 'No market data yet.'}</p>
          ) : (
            <div className="space-y-2">
              {markets.map((m, i) => (
                <div key={m.market} className="flex items-center gap-3 py-2 border-b border-[#f1f3f9] last:border-0">
                  <span className="text-[11px] font-mono text-[#94a3b8] w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1a1b20]">{m.market}</p>
                    <p className="text-[11px] text-[#64748b]">{m.origin_lga}{m.top_commodity ? ` · ${m.top_commodity}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-mono font-semibold text-[#1a1b20]">{m.waybill_count.toLocaleString()}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${MARKET_STATUS_STYLES['normal']}`}>
                    normal
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Live Activity ── */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-semibold text-[#1a1b20]">Realtime Activity</p>
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

    </div>
  );
}
