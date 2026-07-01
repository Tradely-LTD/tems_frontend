/**
 * @module superadmin_screens
 * @depends services/orgSlice
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListOrgsQuery, useUpdateOrgMutation, useCreateOrgMutation } from './services/orgSlice';
import type { Org, CreateOrgInput, UpdateOrgInput } from './services/types';
import { buildSubConcDetailRoute } from '@/constants/routes';

const ORG_TYPE_OPTIONS = [
  'subconcessionaire',
  'concessionaire',
  'cooperative',
  'private_company',
  'government',
];

const EMPTY_FORM: CreateOrgInput = {
  name: '',
  org_type: 'subconcessionaire',
  contact_email: '',
  contact_phone: '',
  is_active: true,
};

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={active ? { backgroundColor: '#e6f4ef', color: '#096c4b' } : { backgroundColor: '#f1f3f9', color: '#94a3b8' }}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function SubConcManagement() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useListOrgsQuery({ page: 1, limit: 100 });
  const [updateOrg, { isLoading: updating }] = useUpdateOrgMutation();
  const [createOrg, { isLoading: creating }]  = useCreateOrgMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateOrgInput>(EMPTY_FORM);

  const [editTarget, setEditTarget] = useState<Org | null>(null);
  const [editForm, setEditForm]     = useState<UpdateOrgInput>({});

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [createError, setCreateError] = useState('');

  const allOrgs: Org[] = (data?.data ?? []) as Org[];
  const orgs = allOrgs.filter((o) => {
    const matchesFilter =
      filter === 'all' || (filter === 'active' ? o.is_active : !o.is_active);
    const matchesSearch =
      !search || o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.contact_email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    total:    allOrgs.length,
    active:   allOrgs.filter((o) => o.is_active).length,
    inactive: allOrgs.filter((o) => !o.is_active).length,
  };

  async function handleApprove(id: string) {
    await updateOrg({ id, body: { is_active: true } });
  }

  async function handleDeactivate(id: string) {
    await updateOrg({ id, body: { is_active: false } });
  }

  function openEdit(org: Org) {
    setEditTarget(org);
    setEditForm({ name: org.name, contact_email: org.contact_email ?? '', contact_phone: org.contact_phone ?? '' });
  }

  async function handleEditSave() {
    if (!editTarget) return;
    await updateOrg({ id: editTarget.id, body: editForm });
    setEditTarget(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    try {
      await createOrg(createForm).unwrap();
      setCreateForm(EMPTY_FORM);
      setShowCreate(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setCreateError(e?.data?.message ?? 'Failed to create sub-concessionaire');
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1b20]">Sub-Concessionaire Management</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Create, approve, and manage sub-concessionaire organisations</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors"
        >
          + New Sub-Conc
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: counts.total,    color: '#002366', bg: '#e8edf7' },
          { label: 'Active',   value: counts.active,   color: '#096c4b', bg: '#e6f4ef' },
          { label: 'Inactive', value: counts.inactive, color: '#94a3b8', bg: '#f1f3f9' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-[#e2e4ed] p-4" style={{ backgroundColor: k.bg }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{k.label}</p>
            <p className="text-[28px] font-bold mt-0.5" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
        />
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
              filter === f ? 'bg-[#002366] text-white' : 'bg-white border border-[#c5c6d2] text-[#64748b] hover:border-[#435b9f]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
        {isLoading && <div className="py-12 text-center text-[#94a3b8] text-[13px]">Loading…</div>}
        {isError   && <div className="py-12 text-center text-[#dc2626] text-[13px]">Failed to load organisations.</div>}
        {!isLoading && !isError && (
          <table className="w-full text-[12px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                <th className="text-left font-semibold text-[#64748b] px-5 py-3">Organisation</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Type</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Contact</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Status</th>
                <th className="text-left font-semibold text-[#64748b] px-4 py-3">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd]">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-[#1a1b20]">{org.name}</p>
                    <p className="text-[10px] text-[#94a3b8] font-mono">{org.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[#64748b] capitalize">{org.org_type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-[#64748b]">
                    <p>{org.contact_email ?? '—'}</p>
                    <p className="text-[10px] text-[#94a3b8]">{org.contact_phone ?? ''}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge active={org.is_active} /></td>
                  <td className="px-4 py-3 text-[#94a3b8]">
                    {new Date(org.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => navigate(buildSubConcDetailRoute(org.id))}
                        className="text-[12px] text-[#435b9f] font-medium hover:underline"
                      >
                        Analytics
                      </button>
                      <button
                        onClick={() => openEdit(org)}
                        className="text-[12px] text-[#002366] font-medium hover:underline"
                      >
                        Edit
                      </button>
                      {!org.is_active ? (
                        <button
                          onClick={() => handleApprove(org.id)}
                          disabled={updating}
                          className="text-[12px] text-[#096c4b] font-semibold hover:underline disabled:opacity-50"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeactivate(org.id)}
                          disabled={updating}
                          className="text-[12px] text-[#dc2626] font-medium hover:underline disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94a3b8]">
                    {search || filter !== 'all' ? 'No results match your filter.' : 'No organisations yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-bold text-[#1a1b20]">New Sub-Concessionaire</p>
              <button onClick={() => { setShowCreate(false); setCreateError(''); }} className="text-[#94a3b8] hover:text-[#1a1b20] text-[20px] leading-none">×</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Organisation Name *</label>
                <input
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Kano North Sub-Conc Ltd"
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Organisation Type *</label>
                <select
                  required
                  value={createForm.org_type}
                  onChange={(e) => setCreateForm({ ...createForm, org_type: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                >
                  {ORG_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={createForm.contact_email ?? ''}
                    onChange={(e) => setCreateForm({ ...createForm, contact_email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Contact Phone</label>
                  <input
                    value={createForm.contact_phone ?? ''}
                    onChange={(e) => setCreateForm({ ...createForm, contact_phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-[#1a1b20] cursor-pointer">
                <input
                  type="checkbox"
                  checked={createForm.is_active ?? true}
                  onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                  className="rounded border-[#c5c6d2]"
                />
                Activate immediately
              </label>
              {createError && (
                <p className="text-[12px] text-[#dc2626] bg-[#fee2e2] px-3 py-2 rounded-lg">{createError}</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateError(''); }}
                  className="text-[13px] font-medium text-[#64748b] px-4 py-2 hover:text-[#1a1b20]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[#002366] text-white text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#001a4d] disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-bold text-[#1a1b20]">Edit — {editTarget.name}</p>
              <button onClick={() => setEditTarget(null)} className="text-[#94a3b8] hover:text-[#1a1b20] text-[20px] leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Name</label>
                <input
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Contact Email</label>
                <input
                  type="email"
                  value={editForm.contact_email ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Contact Phone</label>
                <input
                  value={editForm.contact_phone ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-[13px] font-medium text-[#64748b] px-4 py-2 hover:text-[#1a1b20]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={updating}
                className="bg-[#002366] text-white text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#001a4d] disabled:opacity-50"
              >
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
