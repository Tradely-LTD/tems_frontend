import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';
import { useGetWaybillsQuery } from '@/screens/waybill_screens/services/waybillSlice';

function fmt(n: number) {
  if (n >= 1_000_000_000) return '₦' + (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000)     return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)         return '₦' + (n / 1_000).toFixed(0) + 'K';
  return '₦' + n;
}

const PAY_STYLE: Record<string, { color: string; bg: string }> = {
  success:  { color: '#096c4b', bg: '#e6f4ef' },
  pending:  { color: '#856e0e', bg: '#fdf8e3' },
  failed:   { color: '#b91c1c', bg: '#fee2e2' },
  refunded: { color: '#64748b', bg: '#f1f3f9' },
};

export default function JRBAccountHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: monthData }   = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: weekData }    = useGetAnalyticsSummaryQuery({ period: 'week' });
  const { data: todayData }   = useGetAnalyticsSummaryQuery({ period: 'today' });
  const { data: waybillData, isLoading } = useGetWaybillsQuery({ page: 1, limit: 50 });

  const waybills     = waybillData?.data?.data ?? [];
  const monthRevenue = monthData?.data.total_revenue  ?? 0;
  const monthCount   = monthData?.data.total_waybills ?? 0;
  const weekRevenue  = weekData?.data.total_revenue   ?? 0;
  const todayCount   = todayData?.data.total_waybills ?? 0;

  const paidWaybills    = waybills.filter((w) => w.payment_status === 'success');
  const pendingWaybills = waybills.filter((w) => w.payment_status === 'pending');

  const levyCollected  = paidWaybills.reduce((s, w) => s + parseFloat(w.levy_total ?? '0'), 0);
  const levyPending    = pendingWaybills.reduce((s, w) => s + parseFloat(w.levy_total ?? '0'), 0);

  const kpiCards = [
    { label: 'Revenue This Month',  value: fmt(monthRevenue),  delta: 'Monthly levy collections',       color: '#D4AF37', bg: '#fdf8e3' },
    { label: 'Waybills Processed',  value: monthCount.toLocaleString(), delta: `${todayCount} today`, color: '#002366', bg: '#e8edf7' },
    { label: 'Levy Collected',      value: fmt(levyCollected), delta: 'From paid waybills on record',   color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Pending Collections', value: fmt(levyPending),   delta: `${pendingWaybills.length} unpaid waybills`, color: '#b91c1c', bg: '#fee2e2' },
  ];

  const recentWaybills = waybills.slice(0, 8);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">National Revenue Oversight</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — JRB levy schedules and revenue distribution</p>
        </div>
        <button onClick={() => navigate(ROUTES.WAYBILLS)} className="bg-[#D4AF37] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#c4a030] transition-colors">
          Waybill Ledger
        </button>
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

        {/* Recent levy collections */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Recent Levy Collections</p>
            <button onClick={() => navigate(ROUTES.WAYBILLS)} className="text-[12px] text-[#002366] hover:underline font-medium">View all</button>
          </div>
          {isLoading ? (
            <div className="py-10 text-center text-[#94a3b8] text-[13px]">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
                <tr>
                  <th className="text-left font-semibold text-[#64748b] px-5 py-2.5">Waybill ID</th>
                  <th className="text-left font-semibold text-[#64748b] px-3 py-2.5">Route</th>
                  <th className="text-right font-semibold text-[#64748b] px-3 py-2.5">Levy</th>
                  <th className="text-left font-semibold text-[#64748b] px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentWaybills.map((wb) => {
                  const ps = PAY_STYLE[wb.payment_status] ?? PAY_STYLE.pending;
                  const levy = parseFloat(wb.levy_total ?? '0');
                  return (
                    <tr key={wb.waybill_id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd] cursor-pointer"
                      onClick={() => navigate(`/dashboard/waybills/${wb.waybill_id}`)}>
                      <td className="px-5 py-3 font-mono text-[#002366] font-medium">{wb.waybill_id}</td>
                      <td className="px-3 py-3 text-[#64748b] truncate max-w-[130px]">{wb.origin_state} → {wb.destination_state}</td>
                      <td className="px-3 py-3 text-right font-semibold text-[#D4AF37]">₦{levy.toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: ps.bg, color: ps.color }}>
                          {wb.payment_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recentWaybills.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-[#94a3b8]">No waybill records found.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Revenue summary */}
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-[#D4AF37] to-[#b8941a] rounded-xl p-5 text-[#1a1b20]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5a4200] mb-2">Revenue Summary</p>
            <p className="text-[32px] font-bold">{fmt(monthRevenue)}</p>
            <p className="text-[12px] text-[#5a4200] mt-0.5">This month</p>
            <div className="mt-4 pt-4 border-t border-[#c4a030] space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#5a4200]">This week</span>
                <span className="font-bold">{fmt(weekRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a4200]">Paid waybills</span>
                <span className="font-bold">{paidWaybills.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a4200]">Pending</span>
                <span className="font-bold">{pendingWaybills.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[13px] font-semibold text-[#1a1b20] mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'View Waybill Ledger', path: ROUTES.WAYBILLS },
                { label: 'System Settings',     path: ROUTES.SETTINGS },
              ].map((a) => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#e2e4ed] hover:border-[#c5c6d2] hover:bg-[#f8f9fc] transition-colors text-[12px] font-medium text-[#002366] text-left">
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
