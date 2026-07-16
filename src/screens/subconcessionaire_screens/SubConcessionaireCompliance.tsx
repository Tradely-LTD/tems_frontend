/**
 * @module subconcessionaire_screens
 * @depends agent_screens/services/agentSlice
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildAgentDetailRoute } from '@/constants/routes';
import { useGetAgentsQuery } from '@/screens/agent_screens/services/agentSlice';
import type { AgentRecord } from '@/screens/agent_screens/services/types';

type KycStatus = 'Active' | 'Inactive';

const KYC_BADGE: Record<KycStatus, { bg: string; text: string }> = {
  Active:   { bg: '#e6f4ef', text: '#096c4b' },
  Inactive: { bg: '#f1f3f9', text: '#64748b' },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? '#096c4b' : score >= 60 ? '#D4AF37' : '#dc2626';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-[#e2e8f0]">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-semibold" style={{ color }}>{score}%</span>
    </div>
  );
}

function agentName(a: AgentRecord) {
  return [a.first_name, a.last_name].filter(Boolean).join(' ') || 'Unnamed Agent';
}

export default function SubConcessionaireCompliance() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<KycStatus | 'All'>('All');

  const { data, isLoading, isError } = useGetAgentsQuery({ limit: 100 });
  const agents = data?.data ?? [];

  const counts = {
    All:      agents.length,
    Active:   agents.filter((a) => a.is_active).length,
    Inactive: agents.filter((a) => !a.is_active).length,
  };

  const filtered = filter === 'All' ? agents : agents.filter((a) =>
    filter === 'Active' ? a.is_active : !a.is_active
  );

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Agent Compliance</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">KYC status and activity for your agent network</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { status: 'All',      label: 'Total Agents',  color: '#002366', bg: '#e8edf7' },
          { status: 'Active',   label: 'Active',        color: '#096c4b', bg: '#e6f4ef' },
          { status: 'Inactive', label: 'Inactive',      color: '#64748b', bg: '#f1f3f9' },
        ].map((s) => (
          <button
            key={s.status}
            onClick={() => setFilter(s.status as KycStatus | 'All')}
            className={`text-left p-4 rounded-xl border transition-all ${filter === s.status ? 'ring-2 ring-[#002366]' : 'border-[#e2e4ed] hover:border-[#c5c6d2]'} bg-white`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: s.color }}>
              {counts[s.status as keyof typeof counts]}
            </p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {(['All', 'Active', 'Inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors ${
              filter === f
                ? 'bg-[#002366] text-white'
                : 'bg-white border border-[#e2e4ed] text-[#64748b] hover:border-[#c5c6d2]'
            }`}
          >
            {f} ({counts[f as keyof typeof counts]})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
        {isLoading && <div className="px-5 py-10 text-center text-[#94a3b8] text-[13px]">Loading agents…</div>}
        {isError  && <div className="px-5 py-10 text-center text-[#dc2626] text-[13px]">Failed to load agents.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                <th className="text-left font-semibold text-[#64748b] px-5 py-3">Agent</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Agent ID</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Status</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Onboarded</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Compliance</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const kycStatus: KycStatus = a.is_active ? 'Active' : 'Inactive';
                const badge = KYC_BADGE[kycStatus];
                const score = a.is_active ? 100 : 0;
                const onboarded = new Date(a.created_at).toLocaleDateString('en-GB');
                return (
                  <tr key={a.id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd]">
                    <td className="px-5 py-3.5 font-medium text-[#1a1b20]">{agentName(a)}</td>
                    <td className="px-4 py-3.5 font-mono text-[#64748b] text-[12px]">{a.id.slice(0, 16)}…</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, color: badge.text }}>
                        {kycStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#64748b]">{onboarded}</td>
                    <td className="px-4 py-3.5"><ScoreBar score={score} /></td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => navigate(buildAgentDetailRoute(a.id))}
                        className="text-[12px] text-[#002366] font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#94a3b8]">No agents found.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

    </div>
  );
}
