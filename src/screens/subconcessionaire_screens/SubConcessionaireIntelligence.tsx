/**
 * @module subconcessionaire_screens
 * @depends services/analyticsSlice
 */
import { useGetAnalyticsSummaryQuery } from '@/services/analyticsSlice';

const MONTHLY_DATA = [
  { month: 'Jan', waybills: 312, revenue: 1.2 },
  { month: 'Feb', waybills: 287, revenue: 1.1 },
  { month: 'Mar', waybills: 401, revenue: 1.6 },
  { month: 'Apr', waybills: 378, revenue: 1.5 },
  { month: 'May', waybills: 445, revenue: 1.8 },
  { month: 'Jun', waybills: 523, revenue: 2.1 },
];

const COMMODITIES = [
  { name: 'Grains & Cereals',  pct: 38, color: '#002366' },
  { name: 'Livestock',         pct: 22, color: '#6B21A8' },
  { name: 'Vegetables',        pct: 17, color: '#096c4b' },
  { name: 'Processed Foods',   pct: 13, color: '#D4AF37' },
  { name: 'Other Agric.',      pct: 10, color: '#64748b' },
];

const TOP_CORRIDORS = [
  { from: 'Kano',    to: 'Lagos',  volume: 128, trend: '+14%' },
  { from: 'Sokoto',  to: 'Kano',   volume: 89,  trend: '+7%'  },
  { from: 'Kaduna',  to: 'Abuja',  volume: 76,  trend: '+11%' },
  { from: 'Katsina', to: 'Kano',   volume: 61,  trend: '-3%'  },
  { from: 'Zamfara', to: 'Sokoto', volume: 44,  trend: '+5%'  },
];

const maxWaybills = Math.max(...MONTHLY_DATA.map((d) => d.waybills));

function formatRevenue(n: number) {
  if (n >= 1_000_000) return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return '₦' + (n / 1_000).toFixed(1) + 'K';
  return '₦' + n;
}

export default function SubConcessionaireIntelligence() {
  const { data: monthData } = useGetAnalyticsSummaryQuery({ period: 'month' });

  const totalWaybills = monthData?.data.total_waybills ?? 0;
  const totalRevenue  = monthData?.data.total_revenue  ?? 0;
  const avgPerDay     = totalWaybills > 0 ? (totalWaybills / 30).toFixed(1) : '—';

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Intelligence</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Trade analytics and operational insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Waybills This Month', value: totalWaybills.toLocaleString(), note: 'Current month' },
          { label: 'Revenue This Month',  value: formatRevenue(totalRevenue),     note: 'Levy collections' },
          { label: 'Avg per Day',         value: String(avgPerDay),               note: 'Waybills/working day' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{s.label}</p>
            <p className="text-[28px] font-bold text-[#1a1b20] mt-1">{s.value}</p>
            <p className="text-[11px] text-[#94a3b8] mt-0.5">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        <div className="lg:col-span-3 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Monthly Volume Trend</p>
            <div className="flex items-center gap-4 text-[11px] text-[#64748b]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#002366] inline-block" /> Waybills</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#D4AF37] inline-block" /> Revenue (₦M)</span>
            </div>
          </div>
          <div className="flex items-end gap-4 h-[140px]">
            {MONTHLY_DATA.map((d) => {
              const wbPct  = Math.round((d.waybills / maxWaybills) * 100);
              const revPct = Math.round((d.revenue / 2.1) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-[110px]">
                    <div className="flex-1 rounded-t-sm bg-[#002366]" style={{ height: `${wbPct}%` }} title={`${d.waybills} waybills`} />
                    <div className="flex-1 rounded-t-sm bg-[#D4AF37]" style={{ height: `${revPct}%` }} title={`₦${d.revenue}M`} />
                  </div>
                  <span className="text-[10px] text-[#64748b]">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[14px] font-semibold text-[#1a1b20] mb-5">Commodity Breakdown</p>
          <div className="space-y-3">
            {COMMODITIES.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#1a1b20]">{c.name}</span>
                  <span className="text-[12px] font-semibold text-[#1a1b20]">{c.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f3f9]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
        <p className="text-[14px] font-semibold text-[#1a1b20] mb-4">Top Trade Corridors</p>
        <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#e2e4ed]">
              <th className="text-left font-semibold text-[#64748b] pb-2 pr-4">#</th>
              <th className="text-left font-semibold text-[#64748b] pb-2 pr-4">Origin</th>
              <th className="text-left font-semibold text-[#64748b] pb-2 pr-4">Destination</th>
              <th className="text-right font-semibold text-[#64748b] pb-2 pr-4">Waybills</th>
              <th className="text-right font-semibold text-[#64748b] pb-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {TOP_CORRIDORS.map((c, i) => (
              <tr key={i} className="border-b border-[#f1f3f9] last:border-0">
                <td className="py-3 pr-4 text-[#94a3b8] font-mono">{i + 1}</td>
                <td className="py-3 pr-4 font-medium text-[#1a1b20]">{c.from}</td>
                <td className="py-3 pr-4 text-[#1a1b20]">{c.to}</td>
                <td className="py-3 pr-4 text-right font-mono text-[#1a1b20]">{c.volume}</td>
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

    </div>
  );
}
