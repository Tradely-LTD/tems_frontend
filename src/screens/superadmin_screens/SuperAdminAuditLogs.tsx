/**
 * @module superadmin_screens
 * @depends services/auditSlice
 */
import { useState } from 'react';
import { useListAuditLogsQuery } from '@/services/auditSlice';

type EntityFilter = 'All' | 'Waybill' | 'Agent' | 'Identity' | 'Settlement' | 'System';

const ENTITY_COLORS: Record<string, { bg: string; text: string }> = {
  Waybill:    { bg: '#e8edf7', text: '#002366' },
  Agent:      { bg: '#f3e8ff', text: '#6B21A8' },
  Identity:   { bg: '#e6f4ef', text: '#096c4b' },
  Settlement: { bg: '#fdf8e3', text: '#856e0e' },
  System:     { bg: '#f1f3f9', text: '#64748b' },
};

function entityStyle(entityType: string) {
  const et = entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase();
  return ENTITY_COLORS[et] ?? ENTITY_COLORS.System;
}

function downloadCSV(rows: { id: string; entity_type: string; action: string; entity_id?: string | null; org_id?: string | null; created_at: string }[]) {
  const header = ['Timestamp', 'Entity Type', 'Action', 'Reference', 'Org ID'];
  const lines = [header, ...rows.map((e) => [
    new Date(e.created_at).toLocaleString('en-GB'),
    e.entity_type,
    e.action,
    e.entity_id ?? '',
    e.org_id ?? '',
  ])].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SuperAdminAuditLogs() {
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('All');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useListAuditLogsQuery({ page: 1, limit: 100 });

  const logs = data?.data ?? [];

  const filtered = logs.filter((e) => {
    if (entityFilter !== 'All') {
      const et = e.entity_type.charAt(0).toUpperCase() + e.entity_type.slice(1).toLowerCase();
      if (et !== entityFilter) return false;
    }
    if (search && !`${e.entity_type} ${e.action} ${e.entity_id ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters: EntityFilter[] = ['All', 'Waybill', 'Agent', 'Identity', 'Settlement', 'System'];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1b20]">Platform Audit Logs</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Full activity trail across all roles and entities</p>
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
          className="w-full sm:w-80 border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setEntityFilter(f)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                entityFilter === f
                  ? 'bg-[#002366] text-white'
                  : 'bg-white border border-[#e2e4ed] text-[#64748b] hover:border-[#c5c6d2]'
              }`}
            >
              {f}
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
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Entity Type</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Action</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Reference</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Org</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const style = entityStyle(e.entity_type);
                const ts = new Date(e.created_at).toLocaleString('en-GB', {
                  dateStyle: 'short', timeStyle: 'medium',
                });
                return (
                  <tr key={e.id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd]">
                    <td className="px-5 py-3 font-mono text-[#64748b] whitespace-nowrap">{ts}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        {e.entity_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1a1b20]">{e.action}</td>
                    <td className="px-4 py-3 font-mono text-[#64748b]">{e.entity_id ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-[#94a3b8] text-[11px]">
                      {e.org_id ? e.org_id.slice(0, 12) + '…' : '—'}
                    </td>
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
