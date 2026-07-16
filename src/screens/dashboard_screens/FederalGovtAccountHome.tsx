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

const SHIP_STYLE: Record<string, { color: string; bg: string }> = {
  delivered:  { color: '#096c4b', bg: '#e6f4ef' },
  active:     { color: '#002366', bg: '#e8edf7' },
  in_transit: { color: '#0369a1', bg: '#e0f2fe' },
  draft:      { color: '#94a3b8', bg: '#f1f3f9' },
  cancelled:  { color: '#b91c1c', bg: '#fee2e2' },
  disputed:   { color: '#856e0e', bg: '#fdf8e3' },
};

export default function FederalGovtAccountHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: monthData }  = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: weekData }   = useGetAnalyticsSummaryQuery({ period: 'week' });
  const { data: todayData }  = useGetAnalyticsSummaryQuery({ period: 'today' });
  const { data: waybillData, isLoading } = useGetWaybillsQuery({ page: 1, limit: 50 });

  const waybills     = waybillData?.data?.data ?? [];
  const monthRevenue = monthData?.data.total_revenue  ?? 0;
  const monthCount   = monthData?.data.total_waybills ?? 0;
  const weekCount    = weekData?.data.total_waybills  ?? 0;
  const todayCount   = todayData?.data.total_waybills ?? 0;

  const delivered    = waybills.filter((w) => w.shipment_status === 'delivered').length;
  const inTransit    = waybills.filter((w) => w.shipment_status === 'in_transit').length;
  const disputed     = waybills.filter((w) => w.shipment_status === 'disputed').length;

  const complianceRate = monthCount > 0 ? Math.round(((monthCount - disputed) / monthCount) * 100) : 100;

  const kpiCards = [
    { label: 'Revenue This Month', value: fmt(monthRevenue),         delta: 'Federal levy share',          color: '#D4AF37', bg: '#fdf8e3' },
    { label: 'Waybills This Month',value: monthCount.toLocaleString(),delta: `${weekCount} this week`,     color: '#002366', bg: '#e8edf7' },
    { label: 'Compliance Rate',    value: `${complianceRate}%`,       delta: `${disputed} disputes active`, color: complianceRate >= 95 ? '#096c4b' : '#D4AF37', bg: complianceRate >= 95 ? '#e6f4ef' : '#fdf8e3' },
    { label: 'Today\'s Activity',  value: String(todayCount),         delta: 'Waybills issued today',      color: '#6B21A8', bg: '#f3e8ff' },
  ];

  const recentWaybills = waybills.slice(0, 8);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Federal Government Portal</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — revenue compliance and national waybill data</p>
        </div>
        <button onClick={() => navigate(ROUTES.WAYBILLS)} className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors">
          Waybill Registry
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

        {/* National waybill registry */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">National Waybill Registry</p>
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
                  <th className="text-left font-semibold text-[#64748b] px-3 py-2.5">Corridor</th>
                  <th className="text-right font-semibold text-[#64748b] px-3 py-2.5">Value</th>
                  <th className="text-left font-semibold text-[#64748b] px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentWaybills.map((wb) => {
                  const ss = SHIP_STYLE[wb.shipment_status] ?? SHIP_STYLE.draft;
                  const val = parseFloat(wb.total_declared_value ?? '0');
                  return (
                    <tr key={wb.waybill_id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd] cursor-pointer"
                      onClick={() => navigate(`/dashboard/waybills/${wb.waybill_id}`)}>
                      <td className="px-5 py-3 font-mono text-[#002366] font-medium">{wb.waybill_id}</td>
                      <td className="px-3 py-3 text-[#64748b]">{wb.origin_state} → {wb.destination_state}</td>
                      <td className="px-3 py-3 text-right text-[#1a1b20] font-medium">₦{val.toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: ss.bg, color: ss.color }}>
                          {wb.shipment_status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recentWaybills.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-[#94a3b8]">No waybill records.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Compliance overview + actions */}
        <div className="space-y-4">
          <div className="bg-[#001a4d] rounded-xl p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#758dd5] mb-4">Compliance Overview</p>
            <div className="space-y-3 text-[12px]">
              {[
                { label: 'Delivered',   value: delivered,   color: '#22c55e' },
                { label: 'In Transit',  value: inTransit,   color: '#60a5fa' },
                { label: 'Disputed',    value: disputed,    color: '#fbbf24' },
                { label: 'Compliance',  value: `${complianceRate}%`, color: complianceRate >= 95 ? '#22c55e' : '#fbbf24' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-white/60">{row.label}</span>
                  <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[13px] font-semibold text-[#1a1b20] mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'View Waybills', path: ROUTES.WAYBILLS },
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
