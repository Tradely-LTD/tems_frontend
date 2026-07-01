import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';
import { useListAuditLogsQuery } from '@/services/auditSlice';
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';
import { useListOrgsQuery } from '@/screens/superadmin_screens/services/orgSlice';

const COMMODITY_FLOWS = [
  { state: 'Kano',    volume: 8420, pct: 100, color: '#002366' },
  { state: 'Lagos',   volume: 7310, pct: 87,  color: '#002366' },
  { state: 'Kaduna',  volume: 5890, pct: 70,  color: '#002366' },
  { state: 'Sokoto',  volume: 4430, pct: 53,  color: '#003fa8' },
  { state: 'Katsina', volume: 3810, pct: 45,  color: '#003fa8' },
  { state: 'Oyo',     volume: 3240, pct: 38,  color: '#435b9f' },
  { state: 'Rivers',  volume: 2980, pct: 35,  color: '#435b9f' },
  { state: 'Borno',   volume: 2150, pct: 26,  color: '#758dd5' },
];

const TOP_CORRIDORS = [
  { from: 'Kano',    to: 'Lagos',  waybills: 2841, trend: '+14%', commodity: 'Grains'     },
  { from: 'Sokoto',  to: 'Kano',   waybills: 1940, trend: '+7%',  commodity: 'Livestock'  },
  { from: 'Kaduna',  to: 'Abuja',  waybills: 1612, trend: '+11%', commodity: 'Vegetables' },
  { from: 'Katsina', to: 'Kano',   waybills: 1321, trend: '-3%',  commodity: 'Grains'     },
  { from: 'Zamfara', to: 'Sokoto', waybills:  987, trend: '+5%',  commodity: 'Livestock'  },
];

function formatRevenue(n: number) {
  if (n >= 1_000_000_000) return '₦' + (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000)     return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)         return '₦' + (n / 1_000).toFixed(0) + 'K';
  return '₦' + n;
}

function deriveAuditType(action: string) {
  const a = action.toLowerCase();
  if (a.includes('waybill')) return 'waybill';
  if (a.includes('kyc'))     return 'kyc';
  if (a.includes('agent'))   return 'agent';
  if (a.includes('settlement') || a.includes('levy')) return 'system';
  return 'system';
}

const EVENT_COLORS: Record<string, string> = {
  waybill: '#002366',
  kyc:     '#096c4b',
  agent:   '#6B21A8',
  system:  '#64748b',
  alert:   '#dc2626',
};

export default function SuperAdminHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: weekData }    = useGetAnalyticsSummaryQuery({ period: 'week' });
  const { data: monthData }   = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: agentsData }  = useGetAgentsQuery({ limit: 200 });
  const { data: orgsData }    = useListOrgsQuery({ limit: 200 });
  const { data: auditData }   = useListAuditLogsQuery({ page: 1, limit: 8 });

  const totalWaybills  = monthData?.data.total_waybills ?? 0;
  const totalRevenue   = monthData?.data.total_revenue  ?? 0;
  const weekWaybills   = weekData?.data.total_waybills  ?? 0;
  const activeAgents   = agentsData?.data.filter((a) => a.is_active).length ?? 0;
  const pendingKyc     = agentsData?.data.filter((a) => !a.is_active).length ?? 0;
  const subConcCount   = orgsData?.data.filter((o) => o.org_type === 'subconcessionaire' || o.org_type === 'partner').length ?? 0;

  const kpiCards = [
    { label: 'Total Waybills (Month)',   value: totalWaybills.toLocaleString(), delta: `+${weekWaybills} this week`, color: '#002366', bg: '#e8edf7' },
    { label: 'Platform Revenue (Month)', value: formatRevenue(totalRevenue),    delta: 'Month to date',              color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Active Agents',            value: activeAgents.toLocaleString(),  delta: `${pendingKyc} pending KYC`,  color: '#6B21A8', bg: '#f3e8ff' },
    { label: 'Sub-Concessionaires',      value: subConcCount.toLocaleString(),  delta: 'Registered on platform',     color: '#D4AF37', bg: '#fdf8e3' },
  ];

  const activityLogs = auditData?.data ?? [];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">System Command Centre</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome, {firstName} — full platform oversight and control</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(ROUTES.SUBCONC_ONBOARDING)}
            className="flex items-center gap-1.5 bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors"
          >
            Onboard Sub-Conc
          </button>
          <button
            onClick={() => navigate(ROUTES.COMPLIANCE)}
            className="flex items-center gap-1.5 bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors"
          >
            Compliance Hub
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{card.label}</p>
            <p className="text-[26px] font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[11px] text-[#64748b] mt-1">{card.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] font-semibold text-[#1a1b20]">National Commodity Flows</p>
            <span className="text-[11px] text-[#64748b] bg-[#f1f3f9] px-2.5 py-1 rounded-full">Top states by volume</span>
          </div>
          <div className="space-y-3">
            {COMMODITY_FLOWS.map((s) => (
              <div key={s.state} className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-[#64748b] w-16 shrink-0">{s.state}</span>
                <div className="flex-1 h-4 rounded-sm bg-[#f1f3f9] overflow-hidden">
                  <div className="h-full rounded-sm transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
                <span className="text-[12px] font-mono text-[#1a1b20] w-14 text-right shrink-0">{s.volume.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Realtime Activity</p>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#096c4b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#096c4b] animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[260px] pr-1">
            {activityLogs.length === 0 ? (
              <p className="text-[12px] text-[#94a3b8]">No recent activity.</p>
            ) : activityLogs.map((ev) => {
              const type = deriveAuditType(ev.action);
              const time = new Date(ev.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={ev.id} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: EVENT_COLORS[type] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1a1b20]">{ev.action}</p>
                    <p className="text-[10px] text-[#94a3b8] truncate">{ev.entity_type} {ev.entity_id ? `· ${ev.entity_id}` : ''}</p>
                  </div>
                  <span className="text-[10px] text-[#94a3b8] shrink-0 font-mono">{time}</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate(ROUTES.AUDIT_LOGS)}
            className="mt-4 text-[12px] text-[#002366] font-medium hover:underline text-center"
          >
            View full audit log →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-semibold text-[#1a1b20]">Top Commodity Corridors</p>
          <button onClick={() => navigate(ROUTES.WAYBILL_LIFECYCLE)} className="text-[12px] text-[#002366] font-medium hover:underline">
            View lifecycle →
          </button>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#e2e4ed]">
              <th className="text-left font-semibold text-[#64748b] pb-2 pr-4">#</th>
              <th className="text-left font-semibold text-[#64748b] pb-2 pr-4">Corridor</th>
              <th className="text-left font-semibold text-[#64748b] pb-2 pr-4">Top Commodity</th>
              <th className="text-right font-semibold text-[#64748b] pb-2 pr-4">Waybills</th>
              <th className="text-right font-semibold text-[#64748b] pb-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {TOP_CORRIDORS.map((c, i) => (
              <tr key={i} className="border-b border-[#f1f3f9] last:border-0">
                <td className="py-3 pr-4 text-[#94a3b8] font-mono">{i + 1}</td>
                <td className="py-3 pr-4">
                  <span className="font-medium text-[#1a1b20]">{c.from}</span>
                  <span className="text-[#94a3b8] mx-1.5">→</span>
                  <span className="text-[#1a1b20]">{c.to}</span>
                </td>
                <td className="py-3 pr-4 text-[#64748b]">{c.commodity}</td>
                <td className="py-3 pr-4 text-right font-mono text-[#1a1b20]">{c.waybills.toLocaleString()}</td>
                <td className="py-3 text-right">
                  <span className={`font-semibold ${c.trend.startsWith('+') ? 'text-[#096c4b]' : 'text-[#dc2626]'}`}>
                    {c.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
