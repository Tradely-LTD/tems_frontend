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

const SHIP_STYLE: Record<string, { color: string; bg: string }> = {
  delivered:  { color: '#096c4b', bg: '#e6f4ef' },
  active:     { color: '#002366', bg: '#e8edf7' },
  in_transit: { color: '#0369a1', bg: '#e0f2fe' },
  draft:      { color: '#94a3b8', bg: '#f1f3f9' },
  cancelled:  { color: '#b91c1c', bg: '#fee2e2' },
};

export default function LGAAdminHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: monthData }  = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: todayData }  = useGetAnalyticsSummaryQuery({ period: 'today' });
  const { data: agentsData } = useGetAgentsQuery({ limit: 100 });
  const { data: waybillData, isLoading } = useGetWaybillsQuery({ page: 1, limit: 50 });

  const waybills     = waybillData?.data?.data ?? [];
  const monthCount   = monthData?.data.total_waybills ?? 0;
  const monthRevenue = monthData?.data.total_revenue  ?? 0;
  const todayCount   = todayData?.data.total_waybills ?? 0;
  const activeAgents = agentsData?.data.filter((a) => a.is_active).length  ?? 0;
  const pendingKyc   = agentsData?.data.filter((a) => !a.is_active).length ?? 0;

  const kpiCards = [
    { label: 'LGA Waybills (Month)', value: monthCount.toLocaleString(), delta: `${todayCount} today`,       color: '#002366', bg: '#e8edf7' },
    { label: 'Levy Revenue',         value: fmt(monthRevenue),           delta: 'LGA collections',           color: '#D4AF37', bg: '#fdf8e3' },
    { label: 'Active Agents',        value: String(activeAgents),        delta: `${pendingKyc} pending KYC`, color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Enforcement Actions',  value: '—',                         delta: 'Coming soon',               color: '#b91c1c', bg: '#fee2e2' },
  ];

  const today       = new Date().toDateString();
  const todayWbs    = waybills.filter((w) => new Date(w.created_at).toDateString() === today);
  const recentWbs   = waybills.slice(0, 6);
  const topAgents   = (agentsData?.data ?? []).filter((a) => a.is_active).slice(0, 5);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">LGA Operations Dashboard</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — local government area trade and enforcement</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(ROUTES.WAYBILLS)} className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors">
            Waybills
          </button>
          <button onClick={() => navigate(ROUTES.IDENTITY)} className="bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors">
            KYC Queue
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

        {/* Recent waybills */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#1a1b20]">Recent Waybill Activity</p>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">{todayWbs.length} issued today</p>
            </div>
            <button onClick={() => navigate(ROUTES.WAYBILLS)} className="text-[12px] text-[#002366] hover:underline font-medium">View all</button>
          </div>
          {isLoading ? (
            <div className="py-10 text-center text-[#94a3b8] text-[13px]">Loading…</div>
          ) : (
            <table className="w-full text-[12px]">
              <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
                <tr>
                  <th className="text-left font-semibold text-[#64748b] px-5 py-2.5">Waybill ID</th>
                  <th className="text-left font-semibold text-[#64748b] px-3 py-2.5">Route</th>
                  <th className="text-left font-semibold text-[#64748b] px-3 py-2.5">Status</th>
                  <th className="text-left font-semibold text-[#64748b] px-3 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentWbs.map((wb) => {
                  const ss = SHIP_STYLE[wb.shipment_status] ?? SHIP_STYLE.draft;
                  return (
                    <tr key={wb.waybill_id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd] cursor-pointer"
                      onClick={() => navigate(`/dashboard/waybills/${wb.waybill_id}`)}>
                      <td className="px-5 py-3 font-mono text-[#002366] font-medium">{wb.waybill_id}</td>
                      <td className="px-3 py-3 text-[#64748b]">{wb.origin_lga ?? wb.origin_state} → {wb.destination_lga ?? wb.destination_state}</td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: ss.bg, color: ss.color }}>
                          {wb.shipment_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#94a3b8]">{new Date(wb.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  );
                })}
                {recentWbs.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-[#94a3b8]">No waybill activity yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Agent roster */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#1a1b20]">LGA Agents</p>
              <button onClick={() => navigate(ROUTES.AGENTS)} className="text-[12px] text-[#002366] hover:underline font-medium">View all</button>
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
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-[#096c4b] bg-[#e6f4ef]">Active</span>
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
                { label: 'Waybill Activity', path: ROUTES.WAYBILLS,  color: '#002366' },
                { label: 'All Agents',       path: ROUTES.AGENTS,    color: '#096c4b' },
                { label: 'Identity & KYC',   path: ROUTES.IDENTITY,  color: '#6B21A8' },
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
