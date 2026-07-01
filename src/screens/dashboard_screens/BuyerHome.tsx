import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES, buildWaybillDetailRoute } from '@/constants/routes';
import { useGetWaybillsQuery } from '@/screens/waybill_screens/services/waybillSlice';

const SHIP_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  delivered:  { color: '#096c4b', bg: '#e6f4ef', label: 'Delivered'   },
  active:     { color: '#002366', bg: '#e8edf7', label: 'Active'       },
  in_transit: { color: '#0369a1', bg: '#e0f2fe', label: 'In Transit'   },
  draft:      { color: '#94a3b8', bg: '#f1f3f9', label: 'Draft'        },
  cancelled:  { color: '#b91c1c', bg: '#fee2e2', label: 'Cancelled'    },
  disputed:   { color: '#856e0e', bg: '#fdf8e3', label: 'Disputed'     },
  resolved:   { color: '#096c4b', bg: '#e6f4ef', label: 'Resolved'     },
};

export default function BuyerHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: waybillData, isLoading } = useGetWaybillsQuery({ page: 1, limit: 50 });

  const waybills   = waybillData?.data?.data ?? [];
  const delivered  = waybills.filter((w) => w.shipment_status === 'delivered');
  const inTransit  = waybills.filter((w) => w.shipment_status === 'in_transit');
  const active     = waybills.filter((w) => w.shipment_status === 'active');
  const disputed   = waybills.filter((w) => w.shipment_status === 'disputed');

  const kpiCards = [
    { label: 'Total Waybills',   value: String(waybills.length),  delta: 'All time',       color: '#002366', bg: '#e8edf7' },
    { label: 'In Transit',       value: String(inTransit.length + active.length), delta: 'Shipments moving',  color: '#0369a1', bg: '#e0f2fe' },
    { label: 'Delivered',        value: String(delivered.length), delta: 'Successfully',   color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Disputed',         value: String(disputed.length),  delta: disputed.length > 0 ? 'Needs attention' : 'No issues', color: disputed.length > 0 ? '#b91c1c' : '#096c4b', bg: disputed.length > 0 ? '#fee2e2' : '#e6f4ef' },
  ];

  const activeShipments = waybills.filter((w) => ['active', 'in_transit'].includes(w.shipment_status));
  const recentDelivered = delivered.slice(0, 5);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Buyer Dashboard</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — track your shipments and deliveries</p>
        </div>
        <button onClick={() => navigate(ROUTES.WAYBILLS)} className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors">
          All Waybills
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

      {/* Dispute alert */}
      {disputed.length > 0 && (
        <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-xl p-4 flex items-start gap-3">
          <span className="text-[#92400e] text-[18px] shrink-0">⚠</span>
          <div>
            <p className="text-[13px] font-semibold text-[#92400e]">{disputed.length} shipment{disputed.length > 1 ? 's' : ''} flagged as disputed</p>
            <p className="text-[12px] text-[#78350f] mt-0.5">Review and contact your agent to resolve.</p>
          </div>
          <button onClick={() => navigate(ROUTES.WAYBILLS)} className="ml-auto text-[12px] font-semibold text-[#92400e] hover:underline shrink-0">
            Review →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Active / in-transit shipments */}
        <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Active Shipments</p>
            <span className="text-[11px] bg-[#e0f2fe] text-[#0369a1] px-2 py-0.5 rounded-full font-semibold">{activeShipments.length} moving</span>
          </div>
          {isLoading ? (
            <div className="py-10 text-center text-[#94a3b8] text-[13px]">Loading…</div>
          ) : activeShipments.length > 0 ? (
            <div className="divide-y divide-[#f1f3f9]">
              {activeShipments.slice(0, 6).map((wb) => {
                const ss = SHIP_STYLE[wb.shipment_status];
                return (
                  <div key={wb.waybill_id} className="px-5 py-4 hover:bg-[#fafbfd] cursor-pointer"
                    onClick={() => navigate(buildWaybillDetailRoute(wb.waybill_id))}>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-mono font-semibold text-[#002366]">{wb.waybill_id}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: ss.bg, color: ss.color }}>{ss.label}</span>
                    </div>
                    <p className="text-[12px] text-[#64748b] mt-1">{wb.origin_state} → {wb.destination_state}</p>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">Departure: {wb.departure_date} · {wb.commodity_code}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-[#94a3b8] text-[13px]">No active shipments.</p>
          )}
        </div>

        {/* Recently delivered */}
        <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Recently Delivered</p>
            <span className="text-[11px] bg-[#e6f4ef] text-[#096c4b] px-2 py-0.5 rounded-full font-semibold">{delivered.length} total</span>
          </div>
          {recentDelivered.length > 0 ? (
            <div className="divide-y divide-[#f1f3f9]">
              {recentDelivered.map((wb) => (
                <div key={wb.waybill_id} className="px-5 py-4 hover:bg-[#fafbfd] cursor-pointer"
                  onClick={() => navigate(buildWaybillDetailRoute(wb.waybill_id))}>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-mono font-semibold text-[#002366]">{wb.waybill_id}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e6f4ef] text-[#096c4b]">Delivered</span>
                  </div>
                  <p className="text-[12px] text-[#64748b] mt-1">{wb.origin_state} → {wb.destination_state}</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">{new Date(wb.created_at).toLocaleDateString('en-GB')} · {wb.commodity_code}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-[#94a3b8] text-[13px]">No delivered shipments yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
