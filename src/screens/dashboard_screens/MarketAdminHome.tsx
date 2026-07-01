import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';
import { useGetWaybillsQuery } from '@/screens/waybill_screens/services/waybillSlice';

function fmt(n: number) {
  if (n >= 1_000_000) return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return '₦' + (n / 1_000).toFixed(0) + 'K';
  return '₦' + n;
}

export default function MarketAdminHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: monthData }  = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: todayData }  = useGetAnalyticsSummaryQuery({ period: 'today' });
  const { data: agentsData } = useGetAgentsQuery({ limit: 100 });
  const { data: waybillData, isLoading } = useGetWaybillsQuery({ page: 1, limit: 30 });

  const waybills     = waybillData?.data?.data ?? [];
  const monthCount   = monthData?.data.total_waybills ?? 0;
  const monthRevenue = monthData?.data.total_revenue  ?? 0;
  const todayCount   = todayData?.data.total_waybills ?? 0;
  const activeAgents = agentsData?.data.filter((a) => a.is_active).length  ?? 0;
  const pendingKyc   = agentsData?.data.filter((a) => !a.is_active).length ?? 0;

  const kpiCards = [
    { label: 'Market Waybills',  value: monthCount.toLocaleString(), delta: `${todayCount} issued today`,   color: '#002366', bg: '#e8edf7' },
    { label: 'Levy Revenue',     value: fmt(monthRevenue),           delta: 'This month',                  color: '#D4AF37', bg: '#fdf8e3' },
    { label: 'Active Agents',    value: String(activeAgents),        delta: `${pendingKyc} pending KYC`,   color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Partners',         value: '—',                         delta: 'Coming soon',                 color: '#6B21A8', bg: '#f3e8ff' },
  ];

  const today     = new Date().toDateString();
  const todayWbs  = waybills.filter((w) => new Date(w.created_at).toDateString() === today);
  const topAgents = (agentsData?.data ?? []).filter((a) => a.is_active).slice(0, 6);

  // Commodity breakdown from waybills
  const commodityCounts: Record<string, number> = {};
  for (const wb of waybills) {
    if (wb.commodity_code) {
      commodityCounts[wb.commodity_code] = (commodityCounts[wb.commodity_code] ?? 0) + 1;
    }
  }
  const topCommodities = Object.entries(commodityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxCommodity = topCommodities[0]?.[1] ?? 1;

  const COMMODITY_COLORS = ['#002366', '#096c4b', '#6B21A8', '#D4AF37', '#0369a1'];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Market Management Portal</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — market waybills, agents, and trade flow</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(ROUTES.WAYBILLS)} className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors">
            Waybills
          </button>
          <button onClick={() => navigate(ROUTES.AGENTS)} className="bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors">
            Agents
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-[#e2e4ed] p-5" style={{ backgroundColor: c.bg }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{c.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[11px] text-[#94a3b8] mt-1">{c.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Commodity flow */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-[#1a1b20]">Top Commodities Traded</p>
              <span className="text-[11px] text-[#94a3b8]">From {waybills.length} waybills on record</span>
            </div>
            {topCommodities.length > 0 ? (
              <div className="space-y-3">
                {topCommodities.map(([code, count], i) => {
                  const pct = Math.round((count / maxCommodity) * 100);
                  return (
                    <div key={code}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium text-[#1a1b20]">{code}</span>
                        <span className="text-[12px] text-[#64748b]">{count} waybills</span>
                      </div>
                      <div className="h-2 bg-[#f1f3f9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COMMODITY_COLORS[i % COMMODITY_COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-[#94a3b8] text-center py-6">No commodity data yet.</p>
            )}
          </div>

          {/* Today's waybills */}
          <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-[#1a1b20]">Today's Waybill Activity</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">{todayWbs.length} waybills</p>
              </div>
              <button onClick={() => navigate(ROUTES.WAYBILLS)} className="text-[12px] text-[#002366] hover:underline font-medium">View all</button>
            </div>
            {isLoading ? (
              <div className="py-8 text-center text-[#94a3b8] text-[13px]">Loading…</div>
            ) : todayWbs.length > 0 ? (
              <div className="divide-y divide-[#f1f3f9]">
                {todayWbs.slice(0, 5).map((wb) => (
                  <div key={wb.waybill_id} className="px-5 py-3 flex items-center justify-between hover:bg-[#fafbfd] cursor-pointer"
                    onClick={() => navigate(`/dashboard/waybills/${wb.waybill_id}`)}>
                    <div>
                      <p className="text-[12px] font-mono font-medium text-[#002366]">{wb.waybill_id}</p>
                      <p className="text-[11px] text-[#64748b]">{wb.origin_state} → {wb.destination_state}</p>
                    </div>
                    <span className="text-[11px] text-[#94a3b8]">{wb.commodity_code}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-[#94a3b8] text-[13px]">No waybills issued today.</p>
            )}
          </div>
        </div>

        {/* Agent roster */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#1a1b20]">Market Agents</p>
              <button onClick={() => navigate(ROUTES.AGENTS)} className="text-[12px] text-[#002366] hover:underline font-medium">All agents</button>
            </div>
            <div className="divide-y divide-[#f1f3f9]">
              {topAgents.map((agent) => {
                const name = [agent.first_name, agent.last_name].filter(Boolean).join(' ') || 'Agent';
                const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
                return (
                  <div key={agent.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e8edf7] flex items-center justify-center shrink-0">
                      <span className="text-[#002366] text-[11px] font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1a1b20] truncate">{name}</p>
                      <p className="text-[11px] text-[#94a3b8]">Tier {agent.tier}</p>
                    </div>
                  </div>
                );
              })}
              {topAgents.length === 0 && (
                <p className="py-6 text-center text-[#94a3b8] text-[12px]">No agents registered.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[13px] font-semibold text-[#1a1b20] mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'Waybill Ledger', path: ROUTES.WAYBILLS, color: '#002366' },
                { label: 'All Agents',     path: ROUTES.AGENTS,   color: '#096c4b' },
              ].map((a) => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#e2e4ed] hover:border-[#c5c6d2] hover:bg-[#f8f9fc] transition-colors text-[12px] font-medium text-left"
                  style={{ color: a.color }}>
                  {a.label}<span className="text-[#94a3b8]">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
