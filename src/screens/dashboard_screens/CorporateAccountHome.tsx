import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES, buildWaybillDetailRoute } from '@/constants/routes';
import { useGetWaybillsQuery } from '@/screens/waybill_screens/services/waybillSlice';
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';

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
  disputed:   { color: '#856e0e', bg: '#fdf8e3' },
};

export default function CorporateAccountHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: monthData }  = useGetAnalyticsSummaryQuery({ period: 'month' });
  const { data: agentsData } = useGetAgentsQuery({ limit: 100 });
  const { data: waybillData, isLoading } = useGetWaybillsQuery({ page: 1, limit: 50 });

  const waybills     = waybillData?.data?.data ?? [];
  const monthRevenue = monthData?.data.total_revenue ?? 0;
  const activeAgents = agentsData?.data.filter((a) => a.is_active).length  ?? 0;
  const pendingKyc   = agentsData?.data.filter((a) => !a.is_active).length ?? 0;

  const activeShipments = waybills.filter((w) => ['active', 'in_transit'].includes(w.shipment_status));
  const delivered       = waybills.filter((w) => w.shipment_status === 'delivered');
  const pending         = waybills.filter((w) => w.payment_status === 'pending');

  const totalLevyPaid = waybills
    .filter((w) => w.payment_status === 'success')
    .reduce((s, w) => s + parseFloat(w.levy_total ?? '0'), 0);

  const kpiCards = [
    { label: 'Waybills Issued',    value: waybills.length.toLocaleString(), delta: 'This account',               color: '#002366', bg: '#e8edf7' },
    { label: 'Levy Paid',          value: fmt(totalLevyPaid),               delta: 'Confirmed payments',         color: '#D4AF37', bg: '#fdf8e3' },
    { label: 'Active Shipments',   value: String(activeShipments.length),   delta: `${pending.length} payment pending`, color: '#0369a1', bg: '#e0f2fe' },
    { label: 'KYC Status',         value: pendingKyc > 0 ? 'Pending' : 'Verified', delta: pendingKyc > 0 ? `${pendingKyc} pending` : `${activeAgents} verified`, color: pendingKyc > 0 ? '#D4AF37' : '#096c4b', bg: pendingKyc > 0 ? '#fdf8e3' : '#e6f4ef' },
  ];

  const recentWaybills = waybills.slice(0, 8);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Logistics Hub</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — corporate fleet, waybills, and trade accounts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(ROUTES.WAYBILLS)} className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors">
            Waybill Ledger
          </button>
          <button onClick={() => navigate(ROUTES.IDENTITY)} className="bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors">
            KYC
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

        {/* Waybill ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Corporate Waybill Ledger</p>
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
                  <th className="text-right font-semibold text-[#64748b] px-3 py-2.5">Levy</th>
                  <th className="text-left font-semibold text-[#64748b] px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentWaybills.map((wb) => {
                  const ss = SHIP_STYLE[wb.shipment_status] ?? SHIP_STYLE.draft;
                  const levy = parseFloat(wb.levy_total ?? '0');
                  return (
                    <tr key={wb.waybill_id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd] cursor-pointer"
                      onClick={() => navigate(buildWaybillDetailRoute(wb.waybill_id))}>
                      <td className="px-5 py-3 font-mono text-[#002366] font-medium">{wb.waybill_id}</td>
                      <td className="px-3 py-3 text-[#64748b]">{wb.origin_state} → {wb.destination_state}</td>
                      <td className="px-3 py-3 text-right text-[#D4AF37] font-semibold">₦{levy.toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: ss.bg, color: ss.color }}>
                          {wb.shipment_status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recentWaybills.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-[#94a3b8]">No waybills found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Fleet summary + actions */}
        <div className="space-y-4">
          <div className="bg-[#00113a] rounded-xl p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#758dd5] mb-4">Fleet Summary</p>
            <div className="space-y-3 text-[12px]">
              {[
                { label: 'Total waybills',     value: waybills.length,          color: 'white' },
                { label: 'Active / in-transit',value: activeShipments.length,   color: '#60a5fa' },
                { label: 'Delivered',          value: delivered.length,         color: '#22c55e' },
                { label: 'Pending payment',    value: pending.length,           color: pending.length > 0 ? '#fbbf24' : '#22c55e' },
                { label: 'Monthly revenue',    value: fmt(monthRevenue),        color: '#D4AF37' },
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
                { label: 'Waybill Ledger',  path: ROUTES.WAYBILLS,  color: '#002366' },
                { label: 'Identity & KYC',  path: ROUTES.IDENTITY,  color: '#6B21A8' },
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
