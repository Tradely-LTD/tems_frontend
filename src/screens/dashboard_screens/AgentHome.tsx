import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { useGetMyAgentProfileQuery } from '@/screens/agent_screens/services/agentSlice';
import { useGetWaybillsQuery } from '@/screens/waybill_screens/services/waybillSlice';

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  active:     { color: '#002366', bg: '#e8edf7' },
  in_transit: { color: '#0369a1', bg: '#e0f2fe' },
  delivered:  { color: '#096c4b', bg: '#e6f4ef' },
  draft:      { color: '#94a3b8', bg: '#f1f3f9' },
  cancelled:  { color: '#b91c1c', bg: '#fee2e2' },
};

export default function AgentHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: profileData } = useGetMyAgentProfileQuery();
  const { data: waybillData, isLoading: wbLoading } = useGetWaybillsQuery({ page: 1, limit: 50 });

  const profile  = profileData?.data;
  const waybills = waybillData?.data?.data ?? [];

  const today = new Date().toDateString();
  const todayWaybills  = waybills.filter((w) => new Date(w.created_at).toDateString() === today);
  const pending        = waybills.filter((w) => w.shipment_status === 'draft' || w.payment_status === 'pending');
  const completed      = waybills.filter((w) => w.shipment_status === 'delivered');
  const floatBalance   = parseFloat(profile?.float_balance ?? '0');

  const kpiCards = [
    { label: 'Waybills Today',  value: String(todayWaybills.length), color: '#002366', bg: '#e8edf7' },
    { label: 'Pending',         value: String(pending.length),        color: '#D4AF37', bg: '#fdf8e3' },
    { label: 'Delivered',       value: String(completed.length),      color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Float Balance',   value: `₦${floatBalance.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`, color: '#6B21A8', bg: '#f5f3ff' },
  ];

  const recentWaybills = waybills.slice(0, 6);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Trade Agent Portal</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome back, {firstName} — manage your waybills and account</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(ROUTES.WAYBILLS_NEW)}
            className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors"
          >
            + New Waybill
          </button>
          <button
            onClick={() => navigate(ROUTES.AGENTS_ME)}
            className="bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors"
          >
            My Profile
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#e2e4ed] p-5" style={{ backgroundColor: card.bg }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{card.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent waybills */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Recent Waybills</p>
            <button onClick={() => navigate(ROUTES.WAYBILLS)} className="text-[12px] text-[#002366] hover:underline font-medium">
              View all
            </button>
          </div>
          {wbLoading ? (
            <div className="py-10 text-center text-[#94a3b8] text-[13px]">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
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
                {recentWaybills.map((wb) => {
                  const st = STATUS_STYLE[wb.shipment_status] ?? STATUS_STYLE.draft;
                  return (
                    <tr key={wb.waybill_id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd] cursor-pointer"
                      onClick={() => navigate(`/dashboard/waybills/${wb.waybill_id}`)}>
                      <td className="px-5 py-3 font-mono text-[#002366] font-medium">{wb.waybill_id}</td>
                      <td className="px-3 py-3 text-[#64748b] truncate max-w-[140px]">{wb.origin_state} → {wb.destination_state}</td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: st.bg, color: st.color }}>
                          {wb.shipment_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#94a3b8]">{new Date(wb.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  );
                })}
                {recentWaybills.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-[#94a3b8]">No waybills yet. Issue your first one.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Profile + Quick actions */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-[#00113a] rounded-xl p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#758dd5] mb-3">My Account</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#002366] flex items-center justify-center shrink-0">
                <span className="text-white text-[13px] font-bold">
                  {user?.full_name?.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? '?'}
                </span>
              </div>
              <div>
                <p className="text-[14px] font-semibold">{user?.full_name}</p>
                <p className="text-[11px] text-[#758dd5]">{profile?.identity?.tems_id ?? 'KYC Pending'}</p>
              </div>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-white/50">Float Balance</span>
                <span className="font-bold text-[#D4AF37]">₦{floatBalance.toLocaleString('en-NG')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">KYC Status</span>
                <span className={`font-semibold ${profile?.identity?.kyc_status === 'verified' ? 'text-[#22c55e]' : 'text-[#fbbf24]'}`}>
                  {profile?.identity?.kyc_status ?? 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Tier</span>
                <span className="font-medium">Tier {profile?.tier ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[13px] font-semibold text-[#1a1b20] mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'Issue New Waybill',  path: ROUTES.WAYBILLS_NEW,          color: '#002366' },
                { label: 'My Agent Profile',   path: ROUTES.AGENTS_ME,             color: '#435b9f' },
                { label: 'Identity & KYC',     path: ROUTES.IDENTITY,              color: '#096c4b' },
                { label: 'Report Incident',    path: ROUTES.INCIDENT_REPORTING,    color: '#dc2626' },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#e2e4ed] hover:border-[#c5c6d2] hover:bg-[#f8f9fc] transition-colors text-[12px] font-medium text-left"
                  style={{ color: a.color }}
                >
                  {a.label}
                  <span className="text-[#94a3b8]">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
