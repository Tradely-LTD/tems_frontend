/**
 * @module superadmin_screens
 * @depends agent_screens/services/agentSlice, services/auditSlice
 */
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';
import { useListAuditLogsQuery } from '@/services/auditSlice';

const STATE_DENSITY = [
  { state: 'Kano',       agents: 312, active: 298, pct: 100 },
  { state: 'Lagos',      agents: 287, active: 271, pct: 92  },
  { state: 'Kaduna',     agents: 201, active: 189, pct: 64  },
  { state: 'Oyo',        agents: 178, active: 163, pct: 57  },
  { state: 'Rivers',     agents: 155, active: 143, pct: 50  },
  { state: 'Sokoto',     agents: 134, active: 121, pct: 43  },
  { state: 'Katsina',    agents: 112, active:  97, pct: 36  },
  { state: 'Borno',      agents:  98, active:  84, pct: 31  },
  { state: 'Adamawa',    agents:  87, active:  79, pct: 28  },
  { state: 'Zamfara',    agents:  74, active:  62, pct: 24  },
];

const RECENT_ACTIVITY = [
  { time: '09:14', event: 'Agent onboarded',      detail: 'Fatima Sule · Kano State',           type: 'new'        },
  { time: '08:52', event: 'KYC approved',          detail: 'Emeka Nwachukwu · Lagos State',       type: 'kyc'        },
  { time: '08:31', event: 'Agent suspended',       detail: 'James Okoro · Policy breach',         type: 'suspension' },
  { time: '07:58', event: 'KYC expired notice',    detail: 'Aisha Musa · AGT-00411',              type: 'warning'    },
  { time: '07:30', event: 'Agent re-activated',    detail: 'Ibrahim Danladi · Kaduna State',      type: 'new'        },
  { time: '07:05', event: 'KYC approved',          detail: 'Chioma Okafor · Rivers State',        type: 'kyc'        },
];

const PERFORMANCE_TIERS = [
  { tier: 'Gold',   count: 342, criteria: '≥ 90% compliance, ≥ 20 WBs/month', color: '#D4AF37', bg: '#fdf8e3' },
  { tier: 'Silver', count: 781, criteria: '70–89% compliance, ≥ 10 WBs/month', color: '#64748b', bg: '#f1f3f9' },
  { tier: 'Bronze', count: 524, criteria: '50–69% compliance',                  color: '#92400e', bg: '#fff7ed' },
  { tier: 'Review', count: 200, criteria: '< 50% compliance or KYC issues',     color: '#dc2626', bg: '#fee2e2' },
];

const EVENT_COLORS: Record<string, string> = {
  new:        '#096c4b',
  kyc:        '#002366',
  suspension: '#dc2626',
  warning:    '#D4AF37',
};

export default function AgentNetworkManagement() {
  const { data: agentsData } = useGetAgentsQuery({ limit: 500 });
  const { data: auditData  } = useListAuditLogsQuery({ page: 1, limit: 6 });

  const agents        = agentsData?.data ?? [];
  const totalAgents   = agents.length;
  const activeAgents  = agents.filter((a) => a.is_active).length;
  const inactiveAgents = agents.filter((a) => !a.is_active).length;

  const kpis = [
    { label: 'Total Agents',      value: totalAgents.toLocaleString(),   color: '#002366' },
    { label: 'Active',            value: activeAgents.toLocaleString(),  color: '#096c4b' },
    { label: 'Inactive / KYC',    value: inactiveAgents.toLocaleString(), color: '#D4AF37' },
    { label: 'Suspended',         value: '0',                            color: '#dc2626' },
  ];

  const activityLogs = auditData?.data ?? [];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Agent Network Management</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">National agent distribution, activities, and performance tiers</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{k.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* National density */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[14px] font-semibold text-[#1a1b20] mb-5">National Agent Density</p>
          <div className="space-y-3">
            {STATE_DENSITY.map((s) => (
              <div key={s.state} className="flex items-center gap-3">
                <span className="text-[12px] text-[#64748b] w-18 shrink-0 w-20">{s.state}</span>
                <div className="flex-1 h-4 rounded-sm bg-[#f1f3f9] overflow-hidden">
                  <div className="h-full rounded-sm bg-[#002366]" style={{ width: `${s.pct}%` }} />
                </div>
                <span className="text-[11px] font-mono text-[#1a1b20] w-12 text-right shrink-0">{s.agents}</span>
                <span className="text-[10px] text-[#094c36] bg-[#e6f4ef] px-1.5 py-0.5 rounded shrink-0">
                  {s.active} active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[14px] font-semibold text-[#1a1b20] mb-4">Agent Activities</p>
          {activityLogs.length === 0 ? (
            <p className="text-[12px] text-[#94a3b8]">No recent activity.</p>
          ) : (
            <div className="space-y-3.5">
              {activityLogs.map((ev) => {
                const a = ev.action.toLowerCase();
                const type = a.includes('agent') ? 'new' : a.includes('kyc') ? 'kyc' : a.includes('suspend') ? 'suspension' : 'new';
                const time = new Date(ev.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={ev.id} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: EVENT_COLORS[type] ?? '#64748b' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1a1b20]">{ev.action}</p>
                      <p className="text-[11px] text-[#94a3b8] truncate">{ev.entity_id ?? ev.entity_type}</p>
                    </div>
                    <span className="text-[10px] text-[#94a3b8] shrink-0 font-mono">{time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Performance tiers */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
        <p className="text-[14px] font-semibold text-[#1a1b20] mb-5">Performance Tiers</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERFORMANCE_TIERS.map((t) => (
            <div key={t.tier} className="border border-[#e2e4ed] rounded-xl p-5" style={{ backgroundColor: t.bg }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold" style={{ color: t.color }}>{t.tier}</span>
                <span className="text-[22px] font-bold" style={{ color: t.color }}>{t.count}</span>
              </div>
              <p className="text-[11px] text-[#64748b] leading-relaxed">{t.criteria}</p>
              <div className="mt-3 h-1.5 rounded-full bg-white/60">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.round((t.count / 1847) * 100)}%`, backgroundColor: t.color }}
                />
              </div>
              <p className="text-[10px] text-[#94a3b8] mt-1">{Math.round((t.count / 1847) * 100)}% of network</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
