/**
 * @module superadmin_screens
 * @depends services/orgSlice, agent_screens/services/agentSlice
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useListOrgsQuery } from './services/orgSlice';
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';
import { buildSubConcDetailRoute, buildAgentDetailRoute } from '@/constants/routes';

type Tab = 'overview' | 'identity' | 'subconcessionaires' | 'agents';

const OVERVIEW_METRICS = [
  { label: 'Overall Compliance Score', value: '87%',  color: '#096c4b', bg: '#e6f4ef', desc: 'Across all entities'           },
  { label: 'Pending KYC Reviews',      value:  '34',  color: '#856e0e', bg: '#fdf8e3', desc: 'Agents awaiting approval'      },
  { label: 'Flagged Entities',          value:   '9',  color: '#b91c1c', bg: '#fee2e2', desc: '7 agents, 2 sub-conc'          },
  { label: 'Expired Documents',         value:  '12',  color: '#64748b', bg: '#f1f3f9', desc: 'Require renewal action'        },
];

const IDENTITY_QUEUE = [
  { name: 'Fatima Sule',      id: 'AGT-00443', type: 'Agent', docType: 'NIN',        submitted: '2024-06-22', status: 'Pending'  },
  { name: 'Umar Abdullahi',   id: 'AGT-00441', type: 'Agent', docType: 'BVN + NIN',  submitted: '2024-06-21', status: 'Pending'  },
  { name: 'Ngozi Eze',        id: 'AGT-00438', type: 'Agent', docType: 'CAC Cert',   submitted: '2024-06-21', status: 'Pending'  },
  { name: 'Zaria Agro Ltd',   id: 'SUB-00018', type: 'Sub-Conc', docType: 'CAC + KYC', submitted: '2024-06-20', status: 'Under Review' },
  { name: 'James Okoro',      id: 'AGT-00398', type: 'Agent', docType: 'NIN',        submitted: '2024-06-19', status: 'Flagged'  },
];

const SUBCONC_LIST = [
  { name: 'Kano North Agro Ltd',       id: 'SUB-00001', state: 'Kano',    agents: 42, compliance: 96, kycStatus: 'Verified',    levy: 'Current' },
  { name: 'Sokoto Grains Hub',          id: 'SUB-00002', state: 'Sokoto',  agents: 28, compliance: 91, kycStatus: 'Verified',    levy: 'Current' },
  { name: 'Kaduna Trade Alliance',      id: 'SUB-00003', state: 'Kaduna',  agents: 35, compliance: 88, kycStatus: 'Verified',    levy: 'Current' },
  { name: 'Lagos Commodities Ltd',      id: 'SUB-00004', state: 'Lagos',   agents: 51, compliance: 79, kycStatus: 'Pending',     levy: 'Overdue' },
  { name: 'Zaria Agro Concessionaire',  id: 'SUB-00018', state: 'Kaduna',  agents:  4, compliance: 60, kycStatus: 'Under Review', levy: 'Current' },
  { name: 'Rivers Agro Ltd',            id: 'SUB-00005', state: 'Rivers',  agents: 22, compliance: 42, kycStatus: 'Flagged',     levy: 'Disputed' },
];

const AGENT_FLAGS = [
  { name: 'James Okoro',    id: 'AGT-00398', subconc: 'Rivers Agro Ltd',   reason: 'KYC document mismatch', severity: 'High',   status: 'Open'   },
  { name: 'Aisha Musa',     id: 'AGT-00411', subconc: 'Kano North Agro',   reason: 'KYC expired > 30 days', severity: 'Medium', status: 'Open'   },
  { name: 'Tunde Olawale',  id: 'AGT-00366', subconc: 'Lagos Commodities', reason: 'Waybill anomaly',        severity: 'Medium', status: 'Review' },
  { name: 'Chukwuma Eze',   id: 'AGT-00344', subconc: 'Rivers Agro Ltd',   reason: 'Duplicate waybill flag', severity: 'Low',    status: 'Closed' },
];

const SEV: Record<string, { color: string; bg: string }> = {
  High:   { color: '#b91c1c', bg: '#fee2e2' },
  Medium: { color: '#856e0e', bg: '#fdf8e3' },
  Low:    { color: '#64748b', bg: '#f1f3f9' },
};

const STAT: Record<string, { color: string; bg: string }> = {
  Pending:       { color: '#856e0e', bg: '#fdf8e3' },
  'Under Review':{ color: '#0369a1', bg: '#e0f2fe' },
  Flagged:       { color: '#b91c1c', bg: '#fee2e2' },
  Verified:      { color: '#096c4b', bg: '#e6f4ef' },
  Open:          { color: '#b91c1c', bg: '#fee2e2' },
  Review:        { color: '#856e0e', bg: '#fdf8e3' },
  Closed:        { color: '#64748b', bg: '#f1f3f9' },
  Current:       { color: '#096c4b', bg: '#e6f4ef' },
  Overdue:       { color: '#b91c1c', bg: '#fee2e2' },
  Disputed:      { color: '#856e0e', bg: '#fdf8e3' },
};

export default function ComplianceHub() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const { data: orgsData,   isLoading: orgsLoading }   = useListOrgsQuery({ limit: 100 });
  const { data: agentsData, isLoading: agentsLoading } = useGetAgentsQuery({ limit: 200 });

  const orgs   = orgsData?.data   ?? [];
  const agents = agentsData?.data ?? [];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',           label: 'Overview'           },
    { key: 'identity',           label: 'Identity Portal'    },
    { key: 'subconcessionaires', label: 'Sub-Concessionaires'},
    { key: 'agents',             label: 'Agents'             },
  ];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Compliance Hub</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Identity verification, entity compliance, and flag management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f1f3f9] p-1 rounded-lg max-w-full overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[13px] font-semibold px-4 py-2 rounded-md transition-colors ${
              tab === t.key ? 'bg-white text-[#1a1b20] shadow-sm' : 'text-[#64748b] hover:text-[#1a1b20]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {OVERVIEW_METRICS.map((m) => (
              <div key={m.label} className="rounded-xl border border-[#e2e4ed] p-5" style={{ backgroundColor: m.bg }}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{m.label}</p>
                <p className="text-[30px] font-bold mt-1" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[11px] text-[#64748b] mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { label: 'Identity Portal', desc: 'Review pending KYC documents', route: () => setTab('identity'), count: 5   },
              { label: 'Sub-Concessionaires', desc: 'Check partner compliance', route: () => setTab('subconcessionaires'), count: 6 },
              { label: 'Agents', desc: 'Review flagged agents', route: () => setTab('agents'), count: 4 },
            ].map((c) => (
              <button
                key={c.label}
                onClick={c.route}
                className="text-left bg-white border border-[#e2e4ed] rounded-xl p-5 hover:border-[#002366] hover:bg-[#f8f9fc] transition-all"
              >
                <p className="text-[14px] font-semibold text-[#1a1b20]">{c.label}</p>
                <p className="text-[12px] text-[#64748b] mt-1">{c.desc}</p>
                <p className="text-[11px] font-semibold text-[#002366] mt-2">{c.count} pending →</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'identity' && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e4ed]">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Pending Identity Reviews</p>
            <button
              onClick={() => navigate(ROUTES.IDENTITY)}
              className="text-[12px] text-[#002366] font-medium hover:underline"
            >
              Open Identity Portal →
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                <th className="text-left font-semibold text-[#64748b] px-5 py-3">Name</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">ID</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Type</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Document</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Submitted</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {IDENTITY_QUEUE.map((item) => {
                const s = STAT[item.status] ?? STAT.Pending;
                return (
                  <tr key={item.id} className="border-b border-[#f1f3f9] last:border-0">
                    <td className="px-5 py-3.5 font-medium text-[#1a1b20]">{item.name}</td>
                    <td className="px-4 py-3.5 font-mono text-[#64748b]">{item.id}</td>
                    <td className="px-4 py-3.5 text-[#64748b]">{item.type}</td>
                    <td className="px-4 py-3.5 text-[#64748b]">{item.docType}</td>
                    <td className="px-4 py-3.5 text-[#64748b]">{item.submitted}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => navigate(ROUTES.IDENTITY)} className="text-[12px] text-[#002366] font-medium hover:underline">Review</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'subconcessionaires' && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          {orgsLoading ? (
            <div className="px-5 py-10 text-center text-[#94a3b8] text-[13px]">Loading organisations…</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
                <tr>
                  <th className="text-left font-semibold text-[#64748b] px-5 py-3">Name</th>
                  <th className="text-left font-semibold text-[#64748b] px-4 py-3">Type</th>
                  <th className="text-left font-semibold text-[#64748b] px-4 py-3">Contact</th>
                  <th className="text-left font-semibold text-[#64748b] px-4 py-3">Status</th>
                  <th className="text-left font-semibold text-[#64748b] px-4 py-3">Registered</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => {
                  const activeStyle = o.is_active ? STAT.Current : STAT.Pending;
                  return (
                    <tr key={o.id} className="border-b border-[#f1f3f9] last:border-0">
                      <td className="px-5 py-3.5 font-medium text-[#1a1b20]">{o.name}</td>
                      <td className="px-4 py-3.5 text-[#64748b] capitalize">{o.org_type}</td>
                      <td className="px-4 py-3.5 text-[#64748b]">{o.contact_email ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: activeStyle.bg, color: activeStyle.color }}>
                          {o.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#64748b]">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => navigate(buildSubConcDetailRoute(o.id))} className="text-[12px] text-[#002366] font-medium hover:underline">View</button>
                      </td>
                    </tr>
                  );
                })}
                {orgs.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-[#94a3b8]">No organisations found.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {tab === 'agents' && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e4ed]">
            <p className="text-[14px] font-semibold text-[#1a1b20]">All Agents</p>
          </div>
          {agentsLoading ? (
            <div className="px-5 py-10 text-center text-[#94a3b8] text-[13px]">Loading agents…</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
                <tr>
                  <th className="text-left font-semibold text-[#64748b] px-5 py-3">Agent</th>
                  <th className="text-left font-semibold text-[#64748b] px-4 py-3">Phone</th>
                  <th className="text-left font-semibold text-[#64748b] px-4 py-3">Tier</th>
                  <th className="text-left font-semibold text-[#64748b] px-4 py-3">Status</th>
                  <th className="text-left font-semibold text-[#64748b] px-4 py-3">Onboarded</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => {
                  const name = [a.first_name, a.last_name].filter(Boolean).join(' ') || 'Unnamed Agent';
                  const st = a.is_active ? STAT.Current : STAT.Pending;
                  return (
                    <tr key={a.id} className="border-b border-[#f1f3f9] last:border-0">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#1a1b20]">{name}</p>
                        <p className="text-[10px] text-[#94a3b8] font-mono">{a.id.slice(0, 12)}…</p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#64748b]">{a.phone ?? '—'}</td>
                      <td className="px-4 py-3.5 text-[#64748b]">Tier {a.tier}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: st.bg, color: st.color }}>
                          {a.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#64748b]">{new Date(a.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => navigate(buildAgentDetailRoute(a.id))} className="text-[12px] text-[#002366] font-medium hover:underline">View</button>
                      </td>
                    </tr>
                  );
                })}
                {agents.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-[#94a3b8]">No agents found.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
