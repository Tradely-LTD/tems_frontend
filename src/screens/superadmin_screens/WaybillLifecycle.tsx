/**
 * @module superadmin_screens
 * @depends services/settlementSlice
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildWaybillDetailRoute } from '@/constants/routes';
import { useListSettlementsQuery, useRunSettlementMutation } from './services/settlementSlice';

const LIFECYCLE_STAGES = [
  { stage: 'Issued',     count: 3841, color: '#002366', bg: '#e8edf7', description: 'Waybills generated, goods in transit' },
  { stage: 'Active',     count: 2104, color: '#6B21A8', bg: '#f3e8ff', description: 'Checkpoint scanned, route confirmed'    },
  { stage: 'Completed',  count: 1589, color: '#096c4b', bg: '#e6f4ef', description: 'Delivered, pending settlement'          },
  { stage: 'Settled',    count: 1210, color: '#D4AF37', bg: '#fdf8e3', description: 'Levy collected and disbursed'           },
  { stage: 'Disputed',   count:   38, color: '#dc2626', bg: '#fee2e2', description: 'Under investigation or appeal'         },
  { stage: 'Cancelled',  count:   72, color: '#64748b', bg: '#f1f3f9', description: 'Voided before completion'              },
];

const SETTLEMENT_QUEUE = [
  { ref: 'WB-20240621-4402', subconc: 'Kano North Agro Ltd',   amount: '₦14,200', levy: '₦142', status: 'Ready',   date: '2024-06-21' },
  { ref: 'WB-20240621-4398', subconc: 'Sokoto Grains Hub',     amount: '₦9,800',  levy: '₦98',  status: 'Ready',   date: '2024-06-21' },
  { ref: 'WB-20240621-4391', subconc: 'Kaduna Trade Alliance', amount: '₦22,000', levy: '₦220', status: 'Pending', date: '2024-06-21' },
  { ref: 'WB-20240620-4380', subconc: 'Lagos Commodities Ltd', amount: '₦31,500', levy: '₦315', status: 'Ready',   date: '2024-06-20' },
  { ref: 'WB-20240620-4371', subconc: 'Kano North Agro Ltd',   amount: '₦11,200', levy: '₦112', status: 'Hold',    date: '2024-06-20' },
];

const DISPUTES = [
  { ref: 'WB-20240622-8204', raised: '2024-06-22', type: 'Overcharge', subconc: 'Rivers Agro Ltd',     status: 'Open',       priority: 'High'   },
  { ref: 'WB-20240620-7991', raised: '2024-06-20', type: 'Wrong route', subconc: 'Kano North Agro Ltd', status: 'Under Review', priority: 'Medium' },
  { ref: 'WB-20240618-7644', raised: '2024-06-18', type: 'Duplicate',  subconc: 'Kaduna Alliance',      status: 'Resolved',   priority: 'Low'    },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Ready:        { bg: '#e6f4ef', text: '#096c4b' },
  Pending:      { bg: '#fdf8e3', text: '#856e0e' },
  Hold:         { bg: '#fee2e2', text: '#b91c1c' },
  Open:         { bg: '#fee2e2', text: '#b91c1c' },
  'Under Review': { bg: '#fdf8e3', text: '#856e0e' },
  Resolved:     { bg: '#f1f3f9', text: '#64748b' },
};

const PRIORITY_STYLE: Record<string, { text: string }> = {
  High:   { text: '#dc2626' },
  Medium: { text: '#D4AF37' },
  Low:    { text: '#64748b' },
};

export default function WaybillLifecycle() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]   = useState<'lifecycle' | 'settlement' | 'disputes'>('lifecycle');
  const [runDate, setRunDate]        = useState(new Date().toISOString().slice(0, 10));

  const { data: settlementsData, isLoading: settLoading } = useListSettlementsQuery({ page: 1, limit: 50 });
  const [runSettlement, { isLoading: runLoading }] = useRunSettlementMutation();

  const settlements = Array.isArray(settlementsData?.data)
    ? (settlementsData.data as import('./services/types').Settlement[])
    : ((settlementsData?.data as { data: import('./services/types').Settlement[] } | undefined)?.data ?? []);

  const totalActive = LIFECYCLE_STAGES.reduce((s, st) => s + st.count, 0);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Waybill Lifecycle & Settlement</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Track waybills through their full lifecycle and manage levy settlements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f1f3f9] p-1 rounded-lg max-w-full overflow-x-auto">
        {(['lifecycle', 'settlement', 'disputes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[13px] font-semibold px-4 py-2 rounded-md capitalize transition-colors ${
              activeTab === tab ? 'bg-white text-[#1a1b20] shadow-sm' : 'text-[#64748b] hover:text-[#1a1b20]'
            }`}
          >
            {tab === 'lifecycle' ? 'Lifecycle Management' : tab === 'settlement' ? 'Settlement Queue' : 'Disputes'}
          </button>
        ))}
      </div>

      {activeTab === 'lifecycle' && (
        <div className="space-y-5">
          {/* Funnel */}
          <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
            <p className="text-[14px] font-semibold text-[#1a1b20] mb-6">Current Waybill Stage Distribution</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {LIFECYCLE_STAGES.map((s) => (
                <div key={s.stage} className="text-center" style={{ backgroundColor: s.bg, borderRadius: 12, padding: '16px 12px' }}>
                  <p className="text-[26px] font-bold" style={{ color: s.color }}>{s.count.toLocaleString()}</p>
                  <p className="text-[12px] font-semibold mt-1" style={{ color: s.color }}>{s.stage}</p>
                  <p className="text-[10px] text-[#64748b] mt-1 leading-snug">{s.description}</p>
                  <p className="text-[10px] font-medium mt-2 text-[#94a3b8]">
                    {Math.round((s.count / totalActive) * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Flow bar */}
          <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
            <p className="text-[13px] font-semibold text-[#1a1b20] mb-4">Stage Volume Bar</p>
            <div className="space-y-3">
              {LIFECYCLE_STAGES.map((s) => (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="text-[12px] text-[#64748b] w-20 shrink-0">{s.stage}</span>
                  <div className="flex-1 h-4 rounded-sm bg-[#f1f3f9] overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${Math.round((s.count / 3841) * 100)}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="text-[12px] font-mono text-[#1a1b20] w-16 text-right shrink-0">{s.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settlement' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e2e4ed] p-4 flex items-center gap-3">
            <span className="text-[13px] text-[#64748b]">Run settlement for date:</span>
            <input
              type="date"
              value={runDate}
              onChange={(e) => setRunDate(e.target.value)}
              className="border border-[#c5c6d2] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
            />
            <button
              onClick={() => runSettlement({ date: runDate })}
              disabled={runLoading}
              className="bg-[#002366] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#001a4d] transition-colors disabled:opacity-50"
            >
              {runLoading ? 'Processing…' : 'Run Settlement'}
            </button>
          </div>
          <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e4ed]">
              <p className="text-[14px] font-semibold text-[#1a1b20]">Settlement Records</p>
            </div>
            {settLoading ? (
              <div className="px-5 py-10 text-center text-[#94a3b8] text-[13px]">Loading settlements…</div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
                  <tr>
                    <th className="text-left font-semibold text-[#64748b] px-5 py-3">ID</th>
                    <th className="text-left font-semibold text-[#64748b] px-4 py-3">Date</th>
                    <th className="text-right font-semibold text-[#64748b] px-4 py-3">Waybills</th>
                    <th className="text-right font-semibold text-[#64748b] px-4 py-3">Collected</th>
                    <th className="text-right font-semibold text-[#64748b] px-4 py-3">Disbursed</th>
                    <th className="text-left font-semibold text-[#64748b] px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => {
                    const st = STATUS_STYLE[s.transfer_status] ?? STATUS_STYLE.Pending;
                    return (
                      <tr key={s.id} className="border-b border-[#f1f3f9] last:border-0">
                        <td className="px-5 py-3.5 font-mono text-[#64748b] text-[11px]">{s.id.slice(0, 16)}…</td>
                        <td className="px-4 py-3.5 text-[#64748b]">{s.settlement_date}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#1a1b20]">{s.waybill_count}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#1a1b20]">₦{parseFloat(s.total_collected).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#096c4b]">₦{parseFloat(s.total_disbursed).toLocaleString()}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: st.bg, color: st.text }}>
                            {s.transfer_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-[#94a3b8]">No settlement records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e4ed]">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Active Disputes</p>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                <th className="text-left font-semibold text-[#64748b] px-5 py-3">Waybill</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Type</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Sub-Concessionaire</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Raised</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Priority</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {DISPUTES.map((d) => {
                const st = STATUS_STYLE[d.status] ?? STATUS_STYLE.Pending;
                const pr = PRIORITY_STYLE[d.priority] ?? PRIORITY_STYLE.Low;
                return (
                  <tr key={d.ref} className="border-b border-[#f1f3f9] last:border-0">
                    <td className="px-5 py-3.5 font-mono text-[#64748b]">{d.ref}</td>
                    <td className="px-4 py-3.5 text-[#1a1b20]">{d.type}</td>
                    <td className="px-4 py-3.5 font-medium text-[#1a1b20]">{d.subconc}</td>
                    <td className="px-4 py-3.5 text-[#64748b]">{d.raised}</td>
                    <td className="px-4 py-3.5 font-semibold" style={{ color: pr.text }}>{d.priority}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: st.bg, color: st.text }}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => navigate(buildWaybillDetailRoute(d.ref))} className="text-[12px] text-[#002366] font-medium hover:underline">Review</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

    </div>
  );
}
