/**
 * @module enforcement_screens
 * @depends services/incidentSlice
 */
import { useState } from 'react';
import {
  useListIncidentsQuery,
  useCreateIncidentMutation,
  useUpdateIncidentStateMutation,
} from './services/incidentSlice';
import type { Incident, IncidentType, IncidentState, CreateIncidentInput } from './services/types';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetWaybillsQuery } from '@/screens/waybill_screens/services/waybillSlice';

const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  suspicious_cargo:  'Suspicious Cargo',
  route_deviation:   'Route Deviation',
  overloading:       'Overloading',
  document_missing:  'Missing Document',
  illegal_demand:    'Illegal Demand',
  other:             'Other',
};

const STATE_STYLE: Record<IncidentState, { color: string; bg: string }> = {
  open:           { color: '#b91c1c', bg: '#fee2e2' },
  investigating:  { color: '#0369a1', bg: '#e0f2fe' },
  resolved:       { color: '#096c4b', bg: '#e6f4ef' },
  closed:         { color: '#64748b', bg: '#f1f3f9' },
};

const EMPTY_FORM: CreateIncidentInput = {
  waybill_id:    '',
  incident_type: 'other',
  description:   '',
};

export default function IncidentReporting() {
  const user        = useAppSelector((s) => s.auth.user);
  const isAgent     = user?.role_name === 'Agent';

  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<CreateIncidentInput>(EMPTY_FORM);
  const [selected, setSelected] = useState<Incident | null>(null);

  const { data, isLoading, isError }    = useListIncidentsQuery({ page: 1, limit: 50 });
  const [createIncident, { isLoading: creating, isSuccess }] = useCreateIncidentMutation();
  const [updateState,    { isLoading: updating }]            = useUpdateIncidentStateMutation();

  const { data: waybillData } = useGetWaybillsQuery({ page: 1, limit: 100 }, { skip: !isAgent });
  const myWaybills = waybillData?.data?.data ?? [];

  const incidents = data?.data ?? [];

  const counts = {
    open:          incidents.filter((i) => i.state === 'open').length,
    investigating: incidents.filter((i) => i.state === 'investigating').length,
    resolved:      incidents.filter((i) => i.state === 'resolved').length,
    closed:        incidents.filter((i) => i.state === 'closed').length,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createIncident(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleStateUpdate(id: string, state: IncidentState) {
    await updateState({ id, body: { state } });
    setSelected(null);
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1b20]">Incident Reporting</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Log and manage field enforcement incidents</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); }}
          className="flex items-center gap-1.5 bg-[#dc2626] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#b91c1c] transition-colors"
        >
          + Report Incident
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open',          count: counts.open,          color: '#b91c1c', bg: '#fee2e2' },
          { label: 'Investigating', count: counts.investigating, color: '#0369a1', bg: '#e0f2fe' },
          { label: 'Resolved',      count: counts.resolved,      color: '#096c4b', bg: '#e6f4ef' },
          { label: 'Closed',        count: counts.closed,        color: '#64748b', bg: '#f1f3f9' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[#e2e4ed] p-4" style={{ backgroundColor: s.bg }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</p>
            <p className="text-[26px] font-bold mt-1" style={{ color: s.color }}>{s.count}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[15px] font-semibold text-[#1a1b20] mb-5">New Incident Report</p>
          {isSuccess ? (
            <div className="text-center py-8">
              <p className="text-[14px] font-semibold text-[#096c4b]">Incident reported successfully</p>
              <p className="text-[12px] text-[#64748b] mt-1">Command centre notified.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Waybill ID *</label>
                  {isAgent && myWaybills.length > 0 ? (
                    <select
                      required
                      value={form.waybill_id}
                      onChange={(e) => setForm({ ...form, waybill_id: e.target.value })}
                      className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                    >
                      <option value="">Select a waybill…</option>
                      {myWaybills.map((wb) => (
                        <option key={wb.waybill_id} value={wb.waybill_id}>
                          {wb.waybill_id} — {wb.origin_state} → {wb.destination_state}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      value={form.waybill_id}
                      onChange={(e) => setForm({ ...form, waybill_id: e.target.value })}
                      placeholder="e.g. WB-20240622-8294"
                      className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Incident Type *</label>
                  <select
                    required
                    value={form.incident_type}
                    onChange={(e) => setForm({ ...form, incident_type: e.target.value as IncidentType })}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  >
                    {Object.entries(INCIDENT_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the incident in detail..."
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f] resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="text-[13px] font-medium text-[#64748b] px-4 py-2 hover:text-[#1a1b20]">Cancel</button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[#dc2626] text-white text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
                >
                  {creating ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
        {isLoading && <div className="px-5 py-10 text-center text-[#94a3b8] text-[13px]">Loading incidents…</div>}
        {isError   && <div className="px-5 py-10 text-center text-[#dc2626] text-[13px]">Failed to load incidents.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                <th className="text-left font-semibold text-[#64748b] px-5 py-3">Waybill</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Type</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">State</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Reported</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => {
                const st = STATE_STYLE[inc.state];
                const ts = new Date(inc.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
                return (
                  <tr
                    key={inc.id}
                    className={`border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd] ${selected?.id === inc.id ? 'bg-[#f0f4ff]' : ''}`}
                  >
                    <td className="px-5 py-3 font-mono text-[#64748b]">{inc.waybill_id}</td>
                    <td className="px-4 py-3 text-[#1a1b20]">{INCIDENT_TYPE_LABELS[inc.incident_type] ?? inc.incident_type}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold px-2 py-0.5 rounded-full text-[10px] capitalize" style={{ backgroundColor: st.bg, color: st.color }}>
                        {inc.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">{ts}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
                        className="text-[12px] text-[#002366] font-medium hover:underline"
                      >
                        {selected?.id === inc.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {incidents.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[#94a3b8]">No incidents reported yet.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Incident Detail</p>
            <button onClick={() => setSelected(null)} className="text-[#94a3b8] hover:text-[#1a1b20] text-[16px]">×</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12px]">
            {[
              ['Waybill ID', selected.waybill_id],
              ['Type',       INCIDENT_TYPE_LABELS[selected.incident_type] ?? selected.incident_type],
              ['State',      selected.state],
              ['Reported by', selected.reported_by.slice(0, 8) + '…'],
              ['Created',    new Date(selected.created_at).toLocaleString('en-GB')],
              ['Updated',    new Date(selected.updated_at).toLocaleString('en-GB')],
            ].map(([l, v]) => (
              <div key={l}><p className="text-[#94a3b8]">{l}</p><p className="font-medium text-[#1a1b20] mt-0.5 capitalize">{v}</p></div>
            ))}
          </div>
          {selected.description && (
            <div className="bg-[#f8f9fc] rounded-lg p-4 text-[13px] text-[#1a1b20]">{selected.description}</div>
          )}
          <div className="flex gap-2">
            {selected.state === 'open' && (
              <button
                onClick={() => handleStateUpdate(selected.id, 'investigating')}
                disabled={updating}
                className="bg-[#002366] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#001a4d] disabled:opacity-50"
              >
                {updating ? '…' : 'Start Investigation'}
              </button>
            )}
            {(selected.state === 'open' || selected.state === 'investigating') && (
              <button
                onClick={() => handleStateUpdate(selected.id, 'resolved')}
                disabled={updating}
                className="bg-[#096c4b] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#065c3f] disabled:opacity-50"
              >
                {updating ? '…' : 'Mark Resolved'}
              </button>
            )}
            {selected.state === 'resolved' && (
              <button
                onClick={() => handleStateUpdate(selected.id, 'closed')}
                disabled={updating}
                className="bg-[#64748b] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#475569] disabled:opacity-50"
              >
                {updating ? '…' : 'Close'}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
