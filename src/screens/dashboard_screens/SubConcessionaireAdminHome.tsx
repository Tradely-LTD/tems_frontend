import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';
import { useListAuditLogsQuery } from '@/services/auditSlice';
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';

const WEEKLY_TREND = [
  { day: 'Mon', count: 32 },
  { day: 'Tue', count: 41 },
  { day: 'Wed', count: 38 },
  { day: 'Thu', count: 55 },
  { day: 'Fri', count: 47 },
  { day: 'Sat', count: 29 },
  { day: 'Sun', count: 18 },
];

const maxCount = Math.max(...WEEKLY_TREND.map((d) => d.count));

function formatRevenue(n: number) {
  if (n >= 1_000_000) return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '₦' + (n / 1_000).toFixed(0) + 'K';
  return '₦' + n;
}

function deriveActivityType(action: string) {
  const a = action.toLowerCase();
  if (a.includes('waybill')) return 'waybill';
  if (a.includes('kyc')) return 'kyc';
  if (a.includes('settlement') || a.includes('levy')) return 'settlement';
  if (a.includes('agent')) return 'agent';
  if (a.includes('login') || a.includes('auth')) return 'auth';
  return 'system';
}

const ACTIVITY_COLORS: Record<string, string> = {
  waybill:    '#002366',
  kyc:        '#096c4b',
  settlement: '#D4AF37',
  agent:      '#6B21A8',
  auth:       '#0369a1',
  system:     '#64748b',
};

export default function SubConcessionaireAdminHome() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: todayData }  = useGetAnalyticsSummaryQuery({ period: 'today' });
  const { data: monthData }  = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: agentsData } = useGetAgentsQuery({ limit: 100 });
  const { data: auditData }  = useListAuditLogsQuery({ page: 1, limit: 6 });

  const todayWaybills  = todayData?.data.total_waybills ?? 0;
  const monthRevenue   = monthData?.data.total_revenue  ?? 0;
  const activeAgents   = agentsData?.data.filter((a) => a.is_active).length ?? 0;
  const pendingKyc     = agentsData?.data.filter((a) => !a.is_active).length ?? 0;

  const topAgents = (agentsData?.data ?? [])
    .filter((a) => a.is_active)
    .slice(0, 4);

  const kpiCards = [
    { label: 'Waybills Issued Today', value: String(todayWaybills),   delta: 'Live count',               color: '#002366', bg: '#e8edf7' },
    { label: 'Revenue This Month',    value: formatRevenue(monthRevenue), delta: 'Month to date',         color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Active Agents',         value: String(activeAgents),     delta: `${pendingKyc} pending KYC`, color: '#6B21A8', bg: '#f3e8ff' },
    { label: 'Compliance Rate',       value: '91%',                    delta: '↑ 3% this week',           color: '#D4AF37', bg: '#fdf8e3' },
  ];

  const activityLogs = auditData?.data ?? [];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Concessionaire Portal</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — here's your hub overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(ROUTES.WAYBILLS_NEW)}
            className="flex items-center gap-1.5 bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors"
          >
            <span className="text-lg leading-none">+</span> Issue Waybill
          </button>
          <button
            onClick={() => navigate(ROUTES.AGENTS_NEW)}
            className="flex items-center gap-1.5 bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors"
          >
            Onboard Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[12px] font-medium text-[#64748b] uppercase tracking-wide">{card.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[11px] text-[#64748b] mt-1">{card.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Waybills This Week</p>
            <span className="text-[11px] text-[#64748b] bg-[#f1f3f9] px-2.5 py-1 rounded-full">Last 7 days</span>
          </div>
          <div className="flex items-end gap-3 h-[120px]">
            {WEEKLY_TREND.map((d) => {
              const pct = Math.round((d.count / maxCount) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-[#64748b]">{d.count}</span>
                  <div className="w-full rounded-t-md bg-[#002366]" style={{ height: `${pct}%`, minHeight: 4 }} />
                  <span className="text-[11px] text-[#64748b]">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[14px] font-semibold text-[#1a1b20] mb-4">Active Agents</p>
          {topAgents.length === 0 ? (
            <p className="text-[13px] text-[#94a3b8]">No agents yet.</p>
          ) : (
            <div className="space-y-3">
              {topAgents.map((a, i) => {
                const name = [a.first_name, a.last_name].filter(Boolean).join(' ') || 'Unnamed Agent';
                return (
                  <div key={a.id} className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-[#94a3b8] w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1a1b20] truncate">{name}</p>
                      <p className="text-[10px] text-[#94a3b8] font-mono truncate">{a.id.slice(0, 12)}…</p>
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#e6f4ef] text-[#096c4b]">Active</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-semibold text-[#1a1b20]">Recent Activity</p>
          <button onClick={() => navigate(ROUTES.AUDIT_LOGS)} className="text-[12px] text-[#002366] font-medium hover:underline">
            View full audit log →
          </button>
        </div>
        {activityLogs.length === 0 ? (
          <p className="text-[13px] text-[#94a3b8]">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {activityLogs.map((ev) => {
              const type = deriveActivityType(ev.action);
              const time = new Date(ev.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ACTIVITY_COLORS[type] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a1b20]">
                      <span className="font-medium">{ev.entity_type}</span>{' '}
                      <span className="text-[#64748b]">{ev.action}</span>
                    </p>
                    <p className="text-[11px] text-[#94a3b8] font-mono">{ev.entity_id ?? ev.id.slice(0, 16)}</p>
                  </div>
                  <span className="text-[11px] text-[#94a3b8] shrink-0">{time}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
