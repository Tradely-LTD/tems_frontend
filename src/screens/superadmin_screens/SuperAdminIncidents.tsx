/**
 * @module superadmin_screens
 * @depends enforcement_screens/services/incidentSlice
 */
import { useState } from 'react';
import { useListIncidentsQuery, useUpdateIncidentStateMutation } from '@/screens/enforcement_screens/services/incidentSlice';
import type { IncidentState, IncidentType, Incident } from '@/screens/enforcement_screens/services/types';

const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  suspicious_cargo: 'Suspicious Cargo',
  route_deviation:  'Route Deviation',
  overloading:      'Overloading',
  document_missing: 'Missing Document',
  illegal_demand:   'Illegal Demand',
  other:            'Other',
};

const STATE_STYLE: Record<IncidentState, { color: string; bg: string }> = {
  open:          { color: '#b91c1c', bg: '#fee2e2' },
  investigating: { color: '#0369a1', bg: '#e0f2fe' },
  resolved:      { color: '#096c4b', bg: '#e6f4ef' },
  closed:        { color: '#64748b', bg: '#f1f3f9' },
};

const PRIORITY_STYLE: Record<IncidentType, string> = {
  suspicious_cargo: '#b91c1c',
  illegal_demand:   '#b91c1c',
  overloading:      '#0369a1',
  route_deviation:  '#0369a1',
  document_missing: '#856e0e',
  other:            '#64748b',
};

export default function SuperAdminIncidents() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected]         = useState<Incident | null>(null);

  const { data, isLoading, isError } = useListIncidentsQuery({ page: 1, limit: 200 });
  const [updateState, { isLoading: updating }] = useUpdateIncidentStateMutation();

  const allIncidents = data?.data ?? [];
  const incidents = statusFilter === 'all'
    ? allIncidents
    : allIncidents.filter((i) => i.state === statusFilter);

  const counts = {
    open:          allIncidents.filter((i) => i.state === 'open').length,
    investigating: allIncidents.filter((i) => i.state === 'investigating').length,
    resolved:      allIncidents.filter((i) => i.state === 'resolved').length,
    closed:        allIncidents.filter((i) => i.state === 'closed').length,
  };

  async function advance(id: string, state: IncidentState) {
    await updateState({ id, body: { state } });
    setSelected(null);
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Incident Management</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Platform-wide incident reports from agents and enforcement officers</p>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open',          count: counts.open,          ...STATE_STYLE.open },
          { label: 'Investigating', count: counts.investigating, ...STATE_STYLE.investigating },
          { label: 'Resolved',      count: counts.resolved,      ...STATE_STYLE.resolved },
          { label: 'Closed',        count: counts.closed,        ...STATE_STYLE.closed },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.label.toLowerCase())}
            className={`rounded-xl border p-4 text-left transition-all ${statusFilter === s.label.toLowerCase() ? 'border-[#002366] ring-2 ring-[#002366]/20' : 'border-[#e2e4ed] hover:border-[#c5c6d2]'}`}
            style={{ backgroundColor: s.bg }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: s.color }}>{s.count}</p>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        {['all', 'open', 'investigating', 'resolved', 'closed'].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
              statusFilter === f ? 'bg-[#002366] text-white' : 'bg-white border border-[#c5c6d2] text-[#64748b] hover:border-[#435b9f]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
        {isLoading && <div className="py-12 text-center text-[#94a3b8] text-[13px]">Loading…</div>}
        {isError   && <div className="py-12 text-center text-[#dc2626] text-[13px]">Failed to load incidents.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                <th className="text-left font-semibold text-[#64748b] px-5 py-3">Waybill</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Type</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">State</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Reported</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Description</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => {
                const st   = STATE_STYLE[inc.state];
                const ts   = new Date(inc.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
                const pCol = PRIORITY_STYLE[inc.incident_type] ?? '#64748b';
                return (
                  <tr key={inc.id}
                    className={`border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd] ${selected?.id === inc.id ? 'bg-[#f0f4ff]' : ''}`}>
                    <td className="px-5 py-3 font-mono text-[#64748b]">{inc.waybill_id}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: pCol }}>
                        {INCIDENT_TYPE_LABELS[inc.incident_type] ?? inc.incident_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[10px] px-2 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: st.bg, color: st.color }}>
                        {inc.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">{ts}</td>
                    <td className="px-4 py-3 text-[#64748b] max-w-[180px] truncate">{inc.description ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
                        className="text-[12px] text-[#002366] font-medium hover:underline"
                      >
                        {selected?.id === inc.id ? 'Hide' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {incidents.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-[#94a3b8]">No incidents match this filter.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Detail / actions panel */}
      {selected && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Incident Detail</p>
            <button onClick={() => setSelected(null)} className="text-[#94a3b8] hover:text-[#1a1b20] text-[18px]">×</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12px]">
            {[
              ['Waybill ID',  selected.waybill_id],
              ['Type',        INCIDENT_TYPE_LABELS[selected.incident_type] ?? selected.incident_type],
              ['State',       selected.state],
              ['Reported by', selected.reported_by.slice(0, 8) + '…'],
              ['Created',     new Date(selected.created_at).toLocaleString('en-GB')],
              ['Updated',     new Date(selected.updated_at).toLocaleString('en-GB')],
            ].map(([l, v]) => (
              <div key={l}><p className="text-[#94a3b8]">{l}</p><p className="font-medium text-[#1a1b20] mt-0.5 capitalize">{v}</p></div>
            ))}
          </div>
          {selected.description && (
            <div className="bg-[#f8f9fc] rounded-lg p-4 text-[13px] text-[#1a1b20]">{selected.description}</div>
          )}
          <div className="flex gap-2">
            {selected.state === 'open' && (
              <button onClick={() => advance(selected.id, 'investigating')} disabled={updating}
                className="bg-[#002366] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#001a4d] disabled:opacity-50">
                {updating ? '…' : 'Start Investigation'}
              </button>
            )}
            {(selected.state === 'open' || selected.state === 'investigating') && (
              <button onClick={() => advance(selected.id, 'resolved')} disabled={updating}
                className="bg-[#096c4b] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#065c3f] disabled:opacity-50">
                {updating ? '…' : 'Mark Resolved'}
              </button>
            )}
            {selected.state === 'resolved' && (
              <button onClick={() => advance(selected.id, 'closed')} disabled={updating}
                className="bg-[#64748b] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#475569] disabled:opacity-50">
                {updating ? '…' : 'Close'}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
