import { useState, useMemo } from 'react';
import {
  useListPlatformUsersQuery,
  useCreatePlatformUserMutation,
  useUpdatePlatformUserMutation,
  useUpdateUserPermissionsMutation,
} from './services/userSlice';
import type { PlatformUser, CreatePlatformUserInput, UserStatus } from './services/types';
import { useListAuditLogsQuery } from '@/services/auditSlice';
import { ROLE_NAMES, ROLE_DISPLAY } from '@/config/roles';
import KycReviewQueue from '@/screens/identity_screens/KycReviewQueue';

// ─── constants ──────────────────────────────────────────────────────────────

const ALL_ROLES = Object.values(ROLE_NAMES);

const PERMISSION_GROUPS = [
  { label: 'Waybills',      perms: ['waybill:create', 'waybill:read', 'waybill:cancel', 'waybill:dispute'] },
  { label: 'Identity',      perms: ['identity:submit', 'identity:verify', 'identity:read'] },
  { label: 'Payments',      perms: ['payment:initiate', 'payment:read', 'payment:webhook'] },
  { label: 'Settlement',    perms: ['settlement:run', 'settlement:read'] },
  { label: 'Enforcement',   perms: ['enforcement:scan', 'enforcement:flag'] },
  { label: 'Escrow',        perms: ['escrow:create', 'escrow:release', 'escrow:dispute'] },
  { label: 'Partner',       perms: ['partner:manage', 'partner:read'] },
  { label: 'Agent',         perms: ['agent:manage', 'agent:read'] },
  { label: 'Analytics',     perms: ['analytics:read', 'audit:read'] },
  { label: 'Organisation',  perms: ['org:manage', 'org:read'] },
  { label: 'Configuration', perms: ['config:manage', 'config:read'] },
  { label: 'Users',         perms: ['user:manage', 'user:read'] },
  { label: 'Notifications', perms: ['notification:read', 'notification:manage'] },
  { label: 'Levy',          perms: ['levy:read', 'levy:calculate'] },
  { label: 'Incidents',     perms: ['incident:create', 'incident:read', 'incident:manage'] },
  { label: 'Support',       perms: ['support:create', 'support:read', 'support:manage'] },
];

const STATUS_STYLES: Record<UserStatus, string> = {
  active:    'bg-[#e6f4ef] text-[#096c4b]',
  inactive:  'bg-[#f1f3f9] text-[#64748b]',
  suspended: 'bg-[#fef2f2] text-[#dc2626]',
  pending:   'bg-[#fdf8e3] text-[#92400e]',
};

const LOG_CLASSIFY = (action: string): { label: string; color: string; bg: string } => {
  const a = action.toLowerCase();
  if (a.includes('login') || a.includes('auth') || a.includes('logout'))
    return { label: 'auth',    color: '#64748b', bg: '#f1f3f9' };
  if (a.includes('user') || a.includes('role') || a.includes('permission'))
    return { label: 'iam',     color: '#002366', bg: '#e8edf7' };
  if (a.includes('kyc') || a.includes('identity') || a.includes('verif'))
    return { label: 'kyc',     color: '#6B21A8', bg: '#f3e8ff' };
  if (a.includes('waybill'))
    return { label: 'waybill', color: '#0369a1', bg: '#e0f2fe' };
  if (a.includes('payment') || a.includes('levy') || a.includes('settlement'))
    return { label: 'finance', color: '#096c4b', bg: '#e6f4ef' };
  return { label: 'system', color: '#64748b', bg: '#f1f3f9' };
};

const EMPTY_FORM: CreatePlatformUserInput = {
  full_name: '', email: '', phone: '', password: '',
  role_name: 'StateAdmin', org_name: '', org_type: 'government_body',
};

// ─── sub-components ─────────────────────────────────────────────────────────

function PermissionsModal({
  user,
  onClose,
}: {
  user: PlatformUser;
  onClose: () => void;
}) {
  const rolePerms     = useMemo(() => user.role_permissions ?? [], [user.role_permissions]);
  const initialOverrides = useMemo(() => new Set(user.permission_overrides ?? []), [user.permission_overrides]);
  const [overrides, setOverrides]   = useState<Set<string>>(initialOverrides);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [updatePerms]               = useUpdateUserPermissionsMutation();

  const initials = user.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  function toggleOverride(perm: string) {
    if (rolePerms.includes(perm)) return; // role-based perms are immutable
    setOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm); else next.add(perm);
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updatePerms({ id: user.id, body: { overrides: Array.from(overrides) } }).unwrap();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const overrideCount = overrides.size;
  const totalEffective = new Set([...rolePerms, ...Array.from(overrides)]).size;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      <div className="bg-white h-full w-full max-w-[560px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#e2e4ed] bg-[#f8f9fc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#002366] flex items-center justify-center shrink-0">
              <span className="text-white text-[13px] font-bold">{initials}</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1a1b20]">{user.full_name}</p>
              <p className="text-[11px] text-[#64748b]">
                <span className="bg-[#e8edf7] text-[#002366] px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1">
                  {ROLE_DISPLAY[user.role_name as keyof typeof ROLE_DISPLAY] ?? user.role_name}
                </span>
                {user.org_name ?? '—'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1a1b20] text-[22px] leading-none mt-0.5">×</button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-6 px-6 py-3 border-b border-[#e2e4ed] bg-white text-[12px]">
          <div>
            <span className="text-[#64748b]">From role: </span>
            <span className="font-semibold text-[#1a1b20]">{rolePerms.length}</span>
          </div>
          <div>
            <span className="text-[#64748b]">Overrides: </span>
            <span className="font-semibold text-[#6B21A8]">{overrideCount}</span>
          </div>
          <div>
            <span className="text-[#64748b]">Total effective: </span>
            <span className="font-semibold text-[#002366]">{totalEffective}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-6 py-2.5 border-b border-[#e2e4ed] bg-[#fafbfc] text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#e8edf7] border-2 border-[#002366] flex items-center justify-center">
              <span className="text-[#002366] text-[9px] font-bold">✓</span>
            </div>
            <span className="text-[#64748b]">From role (locked)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#6B21A8] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">✓</span>
            </div>
            <span className="text-[#64748b]">Override added</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border-2 border-[#c5c6d2]" />
            <span className="text-[#64748b]">Not granted</span>
          </div>
        </div>

        {/* Permission groups */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] mb-2">{group.label}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {group.perms.map((perm) => {
                  const fromRole    = rolePerms.includes(perm);
                  const isOverride  = !fromRole && overrides.has(perm);
                  const isActive    = fromRole || isOverride;
                  return (
                    <button
                      key={perm}
                      onClick={() => toggleOverride(perm)}
                      disabled={fromRole}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-left transition-colors ${
                        fromRole
                          ? 'bg-[#e8edf7] text-[#002366] cursor-default'
                          : isOverride
                          ? 'bg-[#f3e8ff] text-[#6B21A8] border border-[#c084fc] hover:bg-[#ede9fe]'
                          : 'bg-white border border-[#e2e4ed] text-[#64748b] hover:border-[#c5c6d2] hover:bg-[#f8f9fc]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center ${
                        fromRole ? 'bg-[#e8edf7] border-2 border-[#002366]'
                        : isOverride ? 'bg-[#6B21A8]'
                        : 'border-2 border-[#c5c6d2]'
                      }`}>
                        {isActive && <span className={`text-[8px] font-bold ${fromRole ? 'text-[#002366]' : 'text-white'}`}>✓</span>}
                      </span>
                      <span className="truncate">{perm}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#e2e4ed] bg-white">
          {saved && <span className="text-[12px] text-[#096c4b] font-medium flex-1">Permissions saved.</span>}
          {!saved && <span className="flex-1" />}
          <button
            onClick={onClose}
            className="text-[13px] font-semibold px-4 py-2 rounded-lg border border-[#c5c6d2] text-[#1a1b20] hover:bg-[#f8f8fb]"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[13px] font-semibold px-5 py-2 rounded-lg bg-[#002366] text-white hover:bg-[#001a4d] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

type Tab = 'users' | 'kyc' | 'audit';

export default function UserAccessManagement() {
  const [tab, setTab] = useState<Tab>('users');

  // users tab state
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('');
  const [orgFilter, setOrg]       = useState('');
  const [showCreate, setCreate]   = useState(false);
  const [form, setForm]           = useState<CreatePlatformUserInput>(EMPTY_FORM);
  const [formErr, setFormErr]     = useState('');
  const [confirmId, setConfirm]   = useState<string | null>(null);
  const [permUser, setPermUser]   = useState<PlatformUser | null>(null);

  // audit tab state
  const [auditType, setAuditType] = useState('');

  const { data, isFetching, refetch } = useListPlatformUsersQuery({ page, limit: 50 });
  const [createUser, { isLoading: creating }] = useCreatePlatformUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdatePlatformUserMutation();
  const { data: auditData, isFetching: auditFetching } = useListAuditLogsQuery({ page: 1, limit: 100 });

  const allUsers: PlatformUser[] = data?.data ?? [];
  const total = data?.meta?.total ?? allUsers.length;

  const orgOptions = useMemo(() => {
    const names = [...new Set(allUsers.map((u) => u.org_name).filter(Boolean))];
    return names.sort() as string[];
  }, [allUsers]);

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      if (roleFilter && u.role_name !== roleFilter) return false;
      if (orgFilter  && u.org_name  !== orgFilter)  return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !u.full_name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !(u.phone ?? '').includes(q)
        ) return false;
      }
      return true;
    });
  }, [allUsers, roleFilter, orgFilter, search]);

  const auditLogs  = auditData?.data ?? [];
  const filteredLogs = auditType
    ? auditLogs.filter((l) => LOG_CLASSIFY(l.action).label === auditType)
    : auditLogs;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormErr('');
    if (!form.full_name || !form.email || !form.phone || !form.password || !form.org_name) {
      setFormErr('All fields are required.');
      return;
    }
    try {
      await createUser(form).unwrap();
      setCreate(false);
      setForm(EMPTY_FORM);
      refetch();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setFormErr(e.data?.message ?? 'Failed to create user. Please try again.');
    }
  }

  async function handleToggleStatus(user: PlatformUser) {
    const next: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await updateUser({ id: user.id, body: { status: next } }).unwrap();
      refetch();
    } catch { /* silent */ }
    finally { setConfirm(null); }
  }

  // ── tab buttons ──
  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'users', label: 'Users & Access', count: total },
    { key: 'kyc',   label: 'KYC Review' },
    { key: 'audit', label: 'Audit Trail', count: filteredLogs.length },
  ];

  return (
    <div className="max-w-[1280px] mx-auto space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Identity & Access Management</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Manage platform users, roles, permissions, KYC review, and access audit trail
          </p>
        </div>
        <button
          onClick={() => { setCreate(true); setFormErr(''); setForm(EMPTY_FORM); }}
          className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors"
        >
          + Create User
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',  value: total,                                               color: '#002366' },
          { label: 'Active',       value: allUsers.filter((u) => u.status === 'active').length,    color: '#096c4b' },
          { label: 'Pending',      value: allUsers.filter((u) => u.status === 'pending').length,   color: '#D4AF37' },
          { label: 'Suspended',    value: allUsers.filter((u) => u.status === 'suspended').length, color: '#dc2626' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e2e4ed] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{s.label}</p>
            <p className="text-[26px] font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-[#e2e4ed] overflow-x-auto">
        <div className="flex gap-0 w-fit min-w-full">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                tab === t.key
                  ? 'border-[#002366] text-[#002366]'
                  : 'border-transparent text-[#64748b] hover:text-[#1a1b20] hover:border-[#c5c6d2]'
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-[#e8edf7] text-[#002366]' : 'bg-[#f1f3f9] text-[#94a3b8]'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Users & Access ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          {/* Search + filters */}
          <div className="bg-white rounded-xl border border-[#e2e4ed] p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px]">⌕</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone…"
                className="w-full pl-8 pr-3 py-2 border border-[#c5c6d2] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#002366]/30"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRole(e.target.value)}
              className="border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#002366]/30"
            >
              <option value="">All Roles</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_DISPLAY[r as keyof typeof ROLE_DISPLAY] ?? r}</option>
              ))}
            </select>
            <select
              value={orgFilter}
              onChange={(e) => setOrg(e.target.value)}
              className="border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#002366]/30"
            >
              <option value="">All Organisations</option>
              {orgOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {(search || roleFilter || orgFilter) && (
              <button
                onClick={() => { setSearch(''); setRole(''); setOrg(''); }}
                className="text-[12px] text-[#64748b] hover:text-[#1a1b20] px-2 py-1 rounded border border-[#e2e4ed] hover:bg-[#f8f9fc]"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-[12px] text-[#94a3b8]">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
            {isFetching ? (
              <div className="p-8 text-center text-[13px] text-[#94a3b8]">Loading users…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[#94a3b8]">No users match the current filters.</div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
                    {['User', 'Role', 'Organisation', 'State', 'Status', 'Last Login', 'Actions'].map((h) => (
                      <th key={h} className="text-left font-semibold text-[#64748b] px-4 py-3 text-[10px] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const initials    = u.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                    const lastLogin   = u.last_login_at
                      ? new Date(u.last_login_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
                      : 'Never';
                    const overrideCount = (u.permission_overrides ?? []).length;
                    return (
                      <tr key={u.id} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbff] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#e8edf7] flex items-center justify-center shrink-0">
                              <span className="text-[#002366] text-[10px] font-bold">{initials}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-[#1a1b20] leading-tight">{u.full_name}</p>
                              <p className="text-[11px] text-[#94a3b8]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-[#e8edf7] text-[#002366] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {ROLE_DISPLAY[u.role_name as keyof typeof ROLE_DISPLAY] ?? u.role_name ?? '—'}
                          </span>
                          {overrideCount > 0 && (
                            <span className="ml-1 bg-[#f3e8ff] text-[#6B21A8] text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                              +{overrideCount}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#64748b]">{u.org_name ?? '—'}</td>
                        <td className="px-4 py-3 text-[#94a3b8]">{u.state_name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[u.status]}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#94a3b8] text-[11px] font-mono">{lastLogin}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPermUser(u)}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-[#c084fc] text-[#6B21A8] hover:bg-[#f3e8ff] transition-colors"
                            >
                              Permissions
                            </button>
                            {confirmId === u.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleToggleStatus(u)} disabled={updating}
                                  className="text-[11px] text-white bg-[#dc2626] px-2 py-0.5 rounded font-medium">
                                  Yes
                                </button>
                                <button onClick={() => setConfirm(null)} className="text-[11px] text-[#64748b] px-2 py-0.5 rounded font-medium">
                                  No
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirm(u.id)}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                                  u.status === 'active'
                                    ? 'border-[#fca5a5] text-[#dc2626] hover:bg-[#fef2f2]'
                                    : 'border-[#86efac] text-[#096c4b] hover:bg-[#e6f4ef]'
                                }`}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}

            {/* Pagination */}
            {total > 50 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e4ed]">
                <p className="text-[12px] text-[#64748b]">Page {page} · {total} users</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="text-[12px] px-3 py-1 rounded border border-[#e2e4ed] text-[#1a1b20] disabled:opacity-40 hover:bg-[#f1f3f9]">
                    Previous
                  </button>
                  <button onClick={() => setPage((p) => p + 1)}
                    className="text-[12px] px-3 py-1 rounded border border-[#e2e4ed] text-[#1a1b20] hover:bg-[#f1f3f9]">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: KYC Review ── */}
      {tab === 'kyc' && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <KycReviewQueue />
        </div>
      )}

      {/* ── Tab: Audit Trail ── */}
      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e2e4ed] p-4 flex items-center gap-3">
            <p className="text-[13px] font-semibold text-[#1a1b20]">Filter by type:</p>
            {['', 'auth', 'iam', 'kyc', 'waybill', 'finance', 'system'].map((type) => (
              <button
                key={type}
                onClick={() => setAuditType(type)}
                className={`text-[11px] px-3 py-1 rounded-full font-medium transition-colors ${
                  auditType === type
                    ? 'bg-[#002366] text-white'
                    : 'bg-[#f1f3f9] text-[#64748b] hover:bg-[#e2e4ed]'
                }`}
              >
                {type || 'All'}
              </button>
            ))}
            <span className="ml-auto text-[12px] text-[#94a3b8]">{filteredLogs.length} events</span>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
            {auditFetching ? (
              <div className="py-10 text-center text-[13px] text-[#94a3b8]">Loading audit logs…</div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-[#94a3b8]">No audit events found.</div>
            ) : (
              <div className="divide-y divide-[#f1f3f9]">
                {filteredLogs.slice(0, 80).map((log) => {
                  const cls = LOG_CLASSIFY(log.action);
                  return (
                    <div key={log.id} className="px-5 py-3 flex items-start gap-3 hover:bg-[#fafbfd]">
                      <span className="mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide"
                        style={{ backgroundColor: cls.bg, color: cls.color }}>
                        {cls.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1a1b20] truncate">{log.action}</p>
                        {log.entity_id && (
                          <p className="text-[11px] text-[#94a3b8] font-mono mt-0.5 truncate">ref: {log.entity_id}</p>
                        )}
                      </div>
                      <p className="text-[10px] text-[#94a3b8] shrink-0 font-mono">
                        {new Date(log.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create User Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e4ed]">
              <div>
                <h2 className="text-[16px] font-bold text-[#1a1b20]">Create Platform User</h2>
                <p className="text-[12px] text-[#64748b] mt-0.5">Assign role and organisation to a new user</p>
              </div>
              <button onClick={() => setCreate(false)} className="text-[#94a3b8] hover:text-[#1a1b20] text-[20px] leading-none">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formErr && (
                <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg px-4 py-3 text-[12px] text-[#dc2626]">
                  {formErr}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Full Name</label>
                  <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="e.g. Amina Usman"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#002366]/30" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Role</label>
                  <select value={form.role_name} onChange={(e) => setForm((f) => ({ ...f, role_name: e.target.value }))}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#002366]/30">
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_DISPLAY[r as keyof typeof ROLE_DISPLAY] ?? r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Organisation Name</label>
                <input value={form.org_name} onChange={(e) => setForm((f) => ({ ...f, org_name: e.target.value }))}
                  placeholder="e.g. Kano State Government"
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#002366]/30" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="user@domain.gov.ng"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#002366]/30" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+2348012345678"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#002366]/30" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Temporary Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#002366]/30" />
                <p className="text-[11px] text-[#94a3b8] mt-1">Share this with the user — they can change it after first login.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreate(false)}
                  className="flex-1 border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#f8f8fb] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 bg-[#002366] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors disabled:opacity-60">
                  {creating ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Permissions Drawer ── */}
      {permUser && (
        <PermissionsModal
          user={permUser}
          onClose={() => { setPermUser(null); refetch(); }}
        />
      )}
    </div>
  );
}
