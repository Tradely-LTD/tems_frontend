import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';
import { useListAuditLogsQuery } from '@/services/auditSlice';
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';
import { useListOrgsQuery } from '@/screens/superadmin_screens/services/orgSlice';

function fmt(n: number) {
  if (n >= 1_000_000_000) return '₦' + (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000)     return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)         return '₦' + (n / 1_000).toFixed(0) + 'K';
  return '₦' + n;
}

const STATUS_COLORS: Record<string, string> = {
  delivered: '#096c4b', active: '#002366', in_transit: '#0369a1',
  draft: '#94a3b8', cancelled: '#b91c1c', disputed: '#D4AF37',
};

export default function NationalAdminHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: monthData }  = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: weekData }   = useGetAnalyticsSummaryQuery({ period: 'week' });
  const { data: agentsData } = useGetAgentsQuery({ limit: 200 });
  const { data: orgsData }   = useListOrgsQuery({ limit: 200 });
  const { data: auditData }  = useListAuditLogsQuery({ page: 1, limit: 8 });

  const totalWaybills = monthData?.data.total_waybills ?? 0;
  const totalRevenue  = monthData?.data.total_revenue  ?? 0;
  const weekWaybills  = weekData?.data.total_waybills  ?? 0;
  const activeAgents  = agentsData?.data.filter((a) => a.is_active).length  ?? 0;
  const pendingKyc    = agentsData?.data.filter((a) => !a.is_active).length ?? 0;
  const subConcCount  = orgsData?.data.filter((o) => o.org_type === 'subconcessionaire').length ?? 0;

  const kpiCards = [
    { label: 'Revenue This Month',  value: fmt(totalRevenue),             delta: 'Levy collections',           color: '#D4AF37', bg: '#fdf8e3' },
    { label: 'Waybills (Monthly)',  value: totalWaybills.toLocaleString(), delta: `${weekWaybills} this week`, color: '#002366', bg: '#e8edf7' },
    { label: 'Active Agents',       value: String(activeAgents),          delta: `${pendingKyc} pending KYC`, color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Sub-Concessionaires', value: String(subConcCount),          delta: 'Licensed operators',        color: '#6B21A8', bg: '#f3e8ff' },
  ];

  const byStatus = monthData?.data.by_status ?? {};
  const activityLogs = auditData?.data ?? [];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Strategic Oversight Dashboard</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — national trade infrastructure overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(ROUTES.WAYBILLS)} className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors">
            View Waybills
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

        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Waybill Status Breakdown — This Month</p>
            <button onClick={() => navigate(ROUTES.WAYBILLS)} className="text-[12px] text-[#002366] hover:underline font-medium">View all</button>
          </div>
          {Object.keys(byStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(byStatus).sort(([, a], [, b]) => b - a).map(([status, count]) => {
                const pct = totalWaybills > 0 ? Math.round((count / totalWaybills) * 100) : 0;
                const color = STATUS_COLORS[status] ?? '#64748b';
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-[#1a1b20] capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-[12px] text-[#64748b]">{count.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[#f1f3f9] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-[#94a3b8] text-center py-8">No waybill data for this period.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#00113a] rounded-xl p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#758dd5] mb-4">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'All Waybills',   path: ROUTES.WAYBILLS   },
                { label: 'Agents',         path: ROUTES.AGENTS     },
                { label: 'Identity & KYC', path: ROUTES.IDENTITY   },
                { label: 'Settings',       path: ROUTES.SETTINGS   },
              ].map((a) => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[12px] font-medium text-white text-left">
                  {a.label}<span className="text-white/40">›</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[13px] font-semibold text-[#1a1b20] mb-3">Platform Snapshot</p>
            <div className="space-y-3 text-[12px]">
              {[
                { label: 'Waybills (month)',   value: totalWaybills.toLocaleString(), color: '#1a1b20' },
                { label: 'This week',          value: weekWaybills.toLocaleString(),  color: '#1a1b20' },
                { label: 'Levy collected',     value: fmt(totalRevenue),              color: '#D4AF37' },
                { label: 'KYC pending',        value: String(pendingKyc),             color: pendingKyc > 0 ? '#D4AF37' : '#096c4b' },
                { label: 'Sub-concessionaires',value: String(subConcCount),           color: '#1a1b20' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[#64748b]">{row.label}</span>
                  <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
          <p className="text-[14px] font-semibold text-[#1a1b20]">Recent Platform Activity</p>
          <button onClick={() => navigate(ROUTES.AUDIT_LOGS)} className="text-[12px] text-[#002366] hover:underline font-medium">Full audit log</button>
        </div>
        <div className="divide-y divide-[#f1f3f9]">
          {activityLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="px-5 py-3 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#002366] shrink-0" />
              <p className="text-[12px] text-[#1a1b20] flex-1 truncate">{log.action}</p>
              <p className="text-[11px] text-[#94a3b8] shrink-0">{new Date(log.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
          ))}
          {activityLogs.length === 0 && <p className="py-8 text-center text-[#94a3b8] text-[13px]">No recent activity.</p>}
        </div>
      </div>

    </div>
  );
}
