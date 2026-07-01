import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';
import { useListAuditLogsQuery } from '@/services/auditSlice';
import { useGetWaybillsQuery } from '@/screens/waybill_screens/services/waybillSlice';

function fmt(n: number) {
  if (n >= 1_000_000_000) return '₦' + (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000)     return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)         return '₦' + (n / 1_000).toFixed(0) + 'K';
  return '₦' + n;
}

const LOG_COLORS: Record<string, { color: string; bg: string }> = {
  waybill:  { color: '#002366', bg: '#e8edf7' },
  payment:  { color: '#096c4b', bg: '#e6f4ef' },
  kyc:      { color: '#6B21A8', bg: '#f3e8ff' },
  agent:    { color: '#0369a1', bg: '#e0f2fe' },
  auth:     { color: '#64748b', bg: '#f1f3f9' },
  system:   { color: '#64748b', bg: '#f1f3f9' },
  alert:    { color: '#b91c1c', bg: '#fee2e2' },
};

function classifyLog(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('waybill'))  return 'waybill';
  if (a.includes('payment') || a.includes('levy')) return 'payment';
  if (a.includes('kyc'))      return 'kyc';
  if (a.includes('agent'))    return 'agent';
  if (a.includes('login') || a.includes('auth')) return 'auth';
  if (a.includes('dispute') || a.includes('incident')) return 'alert';
  return 'system';
}

export default function AuditorHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: monthData }  = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: weekData }   = useGetAnalyticsSummaryQuery({ period: 'week' });
  const { data: auditData }  = useListAuditLogsQuery({ page: 1, limit: 20 });
  const { data: waybillData } = useGetWaybillsQuery({ page: 1, limit: 50 });

  const waybills       = waybillData?.data?.data ?? [];
  const auditLogs      = auditData?.data ?? [];
  const monthRevenue   = monthData?.data.total_revenue  ?? 0;
  const monthWaybills  = monthData?.data.total_waybills ?? 0;
  const weekRevenue    = weekData?.data.total_revenue   ?? 0;

  const disputed  = waybills.filter((w) => w.shipment_status === 'disputed').length;
  const failed    = waybills.filter((w) => w.payment_status  === 'failed').length;
  const auditFlags = disputed + failed;

  const kpiCards = [
    { label: 'Revenue This Month', value: fmt(monthRevenue),          delta: `${fmt(weekRevenue)} this week`, color: '#D4AF37', bg: '#fdf8e3' },
    { label: 'Total Waybills',     value: monthWaybills.toLocaleString(), delta: 'This month',              color: '#002366', bg: '#e8edf7' },
    { label: 'Audit Flags',        value: String(auditFlags),         delta: `${disputed} disputes, ${failed} failed payments`, color: auditFlags > 0 ? '#b91c1c' : '#096c4b', bg: auditFlags > 0 ? '#fee2e2' : '#e6f4ef' },
    { label: 'Audit Log Events',   value: String(auditLogs.length),   delta: 'Recent events loaded',        color: '#6B21A8', bg: '#f3e8ff' },
  ];

  // Revenue trail from paid waybills
  const paidWaybills = waybills.filter((w) => w.payment_status === 'success');
  const totalLevy    = paidWaybills.reduce((s, w) => s + parseFloat(w.levy_total ?? '0'), 0);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Financial Integrity Hub</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — audit logs, revenue trails, and compliance checks</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(ROUTES.WAYBILLS)} className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors">
            Waybill Registry
          </button>
          <button onClick={() => navigate(ROUTES.AUDIT_LOGS)} className="bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors">
            Full Audit Log
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

        {/* Audit log feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Audit Log Feed</p>
            <button onClick={() => navigate(ROUTES.AUDIT_LOGS)} className="text-[12px] text-[#002366] hover:underline font-medium">Full log</button>
          </div>
          <div className="divide-y divide-[#f1f3f9]">
            {auditLogs.slice(0, 10).map((log) => {
              const type  = classifyLog(log.action);
              const style = LOG_COLORS[type];
              return (
                <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                  <span className="mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase" style={{ backgroundColor: style.bg, color: style.color }}>
                    {type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1a1b20] truncate">{log.action}</p>
                    {log.entity_id && (
                      <p className="text-[11px] text-[#94a3b8] mt-0.5 font-mono truncate">ref: {log.entity_id}</p>
                    )}
                  </div>
                  <p className="text-[11px] text-[#94a3b8] shrink-0">
                    {new Date(log.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              );
            })}
            {auditLogs.length === 0 && (
              <p className="py-8 text-center text-[#94a3b8] text-[13px]">No audit events found.</p>
            )}
          </div>
        </div>

        {/* Revenue trail + flags */}
        <div className="space-y-4">
          <div className="bg-[#00113a] rounded-xl p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#758dd5] mb-4">Revenue Trail</p>
            <div className="space-y-3 text-[12px]">
              <div className="flex justify-between">
                <span className="text-white/60">Monthly levy</span>
                <span className="font-bold text-[#D4AF37]">{fmt(monthRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Paid waybills</span>
                <span className="font-bold">{paidWaybills.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Levy confirmed</span>
                <span className="font-bold">₦{totalLevy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Disputes</span>
                <span className={`font-bold ${disputed > 0 ? 'text-[#fbbf24]' : 'text-[#22c55e]'}`}>{disputed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Failed payments</span>
                <span className={`font-bold ${failed > 0 ? 'text-[#f87171]' : 'text-[#22c55e]'}`}>{failed}</span>
              </div>
            </div>
          </div>

          {auditFlags > 0 && (
            <div className="bg-[#fee2e2] border border-[#fca5a5] rounded-xl p-4">
              <p className="text-[12px] font-semibold text-[#b91c1c] mb-1">⚠ Audit Flags Detected</p>
              <p className="text-[11px] text-[#7f1d1d]">{disputed} disputed waybills and {failed} failed payment(s) require review.</p>
              <button onClick={() => navigate(ROUTES.WAYBILLS)} className="mt-3 text-[12px] font-semibold text-[#b91c1c] hover:underline">
                Review waybills →
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[13px] font-semibold text-[#1a1b20] mb-3">Quick Access</p>
            <div className="space-y-2">
              {[
                { label: 'Waybill Registry', path: ROUTES.WAYBILLS,    color: '#002366' },
                { label: 'Full Audit Log',   path: ROUTES.AUDIT_LOGS,  color: '#6B21A8' },
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
