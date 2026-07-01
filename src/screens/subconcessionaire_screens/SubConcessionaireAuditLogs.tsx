/**
 * @module subconcessionaire_screens
 * @depends services/auditSlice
 */
import { useState } from 'react';
import { useListAuditLogsQuery } from '@/services/auditSlice';

type EventType = 'waybill' | 'agent' | 'kyc' | 'settlement' | 'auth' | 'system';

function deriveType(action: string): EventType {
  const a = action.toLowerCase();
  if (a.includes('waybill')) return 'waybill';
  if (a.includes('kyc'))     return 'kyc';
  if (a.includes('settlement') || a.includes('levy')) return 'settlement';
  if (a.includes('agent'))   return 'agent';
  if (a.includes('login') || a.includes('auth') || a.includes('logout')) return 'auth';
  return 'system';
}

const TYPE_STYLES: Record<EventType, { dot: string; badge: string; badgeText: string; label: string }> = {
  waybill:    { dot: '#002366', badge: '#e8edf7', badgeText: '#002366', label: 'Waybill'    },
  agent:      { dot: '#6B21A8', badge: '#f3e8ff', badgeText: '#6B21A8', label: 'Agent'      },
  kyc:        { dot: '#096c4b', badge: '#e6f4ef', badgeText: '#096c4b', label: 'KYC'        },
  settlement: { dot: '#D4AF37', badge: '#fdf8e3', badgeText: '#856e0e', label: 'Settlement' },
  auth:       { dot: '#0369a1', badge: '#e0f2fe', badgeText: '#0369a1', label: 'Auth'       },
  system:     { dot: '#64748b', badge: '#f1f3f9', badgeText: '#64748b', label: 'System'     },
};

const ALL_TYPES: EventType[] = ['waybill', 'agent', 'kyc', 'settlement', 'auth', 'system'];

function downloadCSV(rows: { id: string; entity_type: string; action: string; entity_id?: string | null; created_at: string }[]) {
  const header = ['Timestamp', 'Type', 'Entity', 'Action', 'Reference'];
  const lines = [header, ...rows.map((e) => [
    new Date(e.created_at).toLocaleString('en-GB'),
    deriveType(e.action),
    e.entity_type,
    e.action,
    e.entity_id ?? '',
  ])].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SubConcessionaireAuditLogs() {
  const [typeFilter, setTypeFilter] = useState<EventType | 'All'>('All');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useListAuditLogsQuery({ page: 1, limit: 100 });

  const logs = data?.data ?? [];

  const filtered = logs.filter((e) => {
    const type = deriveType(e.action);
    if (typeFilter !== 'All' && type !== typeFilter) return false;
    if (search && !`${e.entity_type} ${e.action} ${e.entity_id ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1b20]">Audit Logs</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Complete activity trail for your concessionaire account</p>
        </div>
        <button onClick={() => downloadCSV(filtered)} className="flex items-center gap-1.5 bg-white border border-[#e2e4ed] text-[#1a1b20] text-[12px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors">
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entity, action, reference..."
          className="w-full sm:w-72 border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
        />
        <div className="flex flex-wrap gap-2">
          {(['All', ...ALL_TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as EventType | 'All')}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-[#002366] text-white'
                  : 'bg-white border border-[#e2e4ed] text-[#64748b] hover:border-[#c5c6d2]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
        {isLoading && (
          <div className="px-5 py-10 text-center text-[#94a3b8] text-[13px]">Loading audit logs…</div>
        )}
        {isError && (
          <div className="px-5 py-10 text-center text-[#dc2626] text-[13px]">Failed to load audit logs.</div>
        )}
        {!isLoading && !isError && (
          <table className="w-full text-[12px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                <th className="text-left font-semibold text-[#64748b] px-5 py-3">Timestamp</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Type</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Entity</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Action</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const type  = deriveType(e.action);
                const style = TYPE_STYLES[type];
                const ts    = new Date(e.created_at).toLocaleString('en-GB', {
                  dateStyle: 'short', timeStyle: 'medium',
                });
                return (
                  <tr key={e.id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd]">
                    <td className="px-5 py-3 font-mono text-[#64748b] whitespace-nowrap">{ts}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ backgroundColor: style.badge, color: style.badgeText }}
                      >
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1a1b20]">{e.entity_type}</td>
                    <td className="px-4 py-3 text-[#1a1b20]">{e.action}</td>
                    <td className="px-4 py-3 font-mono text-[#64748b]">{e.entity_id ?? '—'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#94a3b8]">No events match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
