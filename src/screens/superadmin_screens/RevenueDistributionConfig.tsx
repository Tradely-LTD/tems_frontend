import { useRevenueDistributionConfig } from './hooks/useRevenueDistributionConfig';
import OnboardStakeholderSlideOver from './OnboardStakeholderSlideOver';
import EditRevenueRuleModal from './EditRevenueRuleModal';
import { RULE_SCOPES, RULE_STATUSES } from './schema/revenueRuleValidationSchema';
import { formatNGN, formatRate } from './utils/revenueFormatters';
import { NIGERIAN_STATE_NAMES, getLgasForState } from '@/constants/nigeria';

const TABS: { key: 'authorities' | 'rules' | 'preview'; label: string }[] = [
  { key: 'authorities', label: 'Revenue Authorities' },
  { key: 'rules', label: 'Revenue Rules' },
  { key: 'preview', label: 'Fee Preview' },
];

export default function RevenueDistributionConfig() {
  const {
    canManageRevenue,
    canReadRevenue,
    tab,
    setTab,
    authorities,
    authoritiesFetching,
    authoritiesError,
    deactivating,
    deactivateError,
    handleDeactivate,
    onboardOpen,
    openOnboard,
    closeOnboard,
    rules,
    rulesFetching,
    rulesError,
    ruleScopeFilter,
    setRuleScopeFilter,
    ruleStatusFilter,
    setRuleStatusFilter,
    authorityNameById,
    ruleModalOpen,
    editingRule,
    openRuleModal,
    closeRuleModal,
    previewForm,
    updatePreviewField,
    previewErrors,
    previewResult,
    previewApiError,
    previewLoading,
    handlePreviewSubmit,
  } = useRevenueDistributionConfig();

  if (!canReadRevenue) {
    return (
      <div className="p-8">
        <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-xl px-6 py-5 text-[13px] text-[#dc2626]">
          You do not have permission to view the Revenue Distribution module.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1b20]">Revenue Distribution Config</h1>
          <p className="text-[13px] text-[#64748b] mt-1">
            Manage revenue authorities, scope-stacked fee rules, and preview commodity fee breakdowns.
          </p>
        </div>
        {canManageRevenue && tab === 'authorities' && (
          <button
            onClick={openOnboard}
            className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors"
          >
            + Onboard Stakeholder
          </button>
        )}
        {canManageRevenue && tab === 'rules' && (
          <button
            onClick={() => openRuleModal(null)}
            className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors"
          >
            + New Rule
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-[#e2e4ed] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[#002366] text-[#002366]'
                : 'border-transparent text-[#64748b] hover:text-[#1a1b20]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'authorities' && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          {deactivateError && (
            <div className="bg-[#fef2f2] border-b border-[#fca5a5] px-6 py-3 text-[12px] text-[#dc2626]">
              {deactivateError}
            </div>
          )}
          {authoritiesError && (
            <div className="px-6 py-8 text-center text-[13px] text-[#dc2626]">
              Failed to load revenue authorities. Please try again.
            </div>
          )}
          {!authoritiesError && authoritiesFetching && (
            <div className="px-6 py-8 text-center text-[13px] text-[#64748b]">Loading authorities…</div>
          )}
          {!authoritiesError && !authoritiesFetching && authorities.length === 0 && (
            <div className="px-6 py-8 text-center text-[13px] text-[#64748b]">No revenue authorities yet.</div>
          )}
          {!authoritiesError && !authoritiesFetching && authorities.length > 0 && (
            <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Code</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Name</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Tier</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Type</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Settlement</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Bank Verified</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Status</th>
                  {canManageRevenue && (
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {authorities.map((a) => (
                  <tr key={a.id} className="border-b border-[#f0f0f5] last:border-0">
                    <td className="px-6 py-3 text-[13px] font-mono text-[#1a1b20]">{a.authority_code}</td>
                    <td className="px-6 py-3 text-[13px] text-[#1a1b20]">{a.authority_name}</td>
                    <td className="px-6 py-3 text-[13px] text-[#64748b] capitalize">{a.tier}</td>
                    <td className="px-6 py-3 text-[13px] text-[#64748b] capitalize">{a.stakeholder_type}</td>
                    <td className="px-6 py-3 text-[13px] text-[#64748b] capitalize">
                      {a.settlement_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          a.nibss_verified ? 'bg-[#e6f4ef] text-[#096c4b]' : 'bg-[#fdf8e3] text-[#92400e]'
                        }`}
                      >
                        {a.nibss_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          a.is_active ? 'bg-[#e6f4ef] text-[#096c4b]' : 'bg-[#f4f3f9] text-[#64748b]'
                        }`}
                      >
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canManageRevenue && (
                      <td className="px-6 py-3">
                        {a.is_active && (
                          <button
                            onClick={() => handleDeactivate(a)}
                            disabled={deactivating}
                            className="text-[12px] font-semibold text-[#dc2626] hover:underline disabled:opacity-50"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {tab === 'rules' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <select
              value={ruleScopeFilter}
              onChange={(e) => setRuleScopeFilter(e.target.value as typeof ruleScopeFilter)}
              className="border border-[#c5c6d2] rounded-lg px-3 py-2 text-[12px] bg-white capitalize focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
            >
              <option value="">All Scopes</option>
              {RULE_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={ruleStatusFilter}
              onChange={(e) => setRuleStatusFilter(e.target.value as typeof ruleStatusFilter)}
              className="border border-[#c5c6d2] rounded-lg px-3 py-2 text-[12px] bg-white capitalize focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
            >
              <option value="">All Statuses</option>
              {RULE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
            {rulesError && (
              <div className="px-6 py-8 text-center text-[13px] text-[#dc2626]">
                Failed to load revenue rules. Please try again.
              </div>
            )}
            {!rulesError && rulesFetching && (
              <div className="px-6 py-8 text-center text-[13px] text-[#64748b]">Loading rules…</div>
            )}
            {!rulesError && !rulesFetching && rules.length === 0 && (
              <div className="px-6 py-8 text-center text-[13px] text-[#64748b]">No revenue rules yet.</div>
            )}
            {!rulesError && !rulesFetching && rules.length > 0 && (
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
                  <tr>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Authority</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Scope</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Location</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Commodity</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Basis</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Rate</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Status</th>
                    {canManageRevenue && (
                      <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.id} className="border-b border-[#f0f0f5] last:border-0">
                      <td className="px-6 py-3 text-[13px] text-[#1a1b20]">
                        {authorityNameById.get(r.authority_id) ?? r.authority_id}
                      </td>
                      <td className="px-6 py-3 text-[13px] text-[#64748b] capitalize">{r.scope}</td>
                      <td className="px-6 py-3 text-[12px] text-[#64748b]">
                        {[r.state_name, r.lga_name].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="px-6 py-3 text-[12px] text-[#64748b]">{r.commodity_code || 'All'}</td>
                      <td className="px-6 py-3 text-[13px] text-[#64748b] capitalize">{r.basis.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-3 text-[13px] text-[#1a1b20]">{formatRate(r.rate)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            r.status === 'active'
                              ? 'bg-[#e6f4ef] text-[#096c4b]'
                              : r.status === 'scheduled'
                                ? 'bg-[#e8edf7] text-[#002366]'
                                : 'bg-[#f4f3f9] text-[#64748b]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      {canManageRevenue && (
                        <td className="px-6 py-3">
                          <button
                            onClick={() => openRuleModal(r)}
                            className="text-[12px] font-semibold text-[#002366] hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handlePreviewSubmit}
            className="bg-white rounded-xl border border-[#e2e4ed] p-6 space-y-4"
          >
            <h2 className="text-[14px] font-bold text-[#1a1b20]">Fee Breakdown Preview</h2>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Commodity Code *
              </label>
              <input
                value={previewForm.commodity_code}
                onChange={(e) => updatePreviewField('commodity_code', e.target.value)}
                placeholder="e.g. MAIZE"
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
              />
              {previewErrors.commodity_code && (
                <p className="text-[11px] text-[#dc2626] mt-1">{previewErrors.commodity_code}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  State *
                </label>
                <select
                  value={previewForm.state_name}
                  onChange={(e) => {
                    updatePreviewField('state_name', e.target.value);
                    updatePreviewField('lga_name', '');
                  }}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                >
                  <option value="">Select state…</option>
                  {NIGERIAN_STATE_NAMES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {previewErrors.state_name && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{previewErrors.state_name}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  LGA
                </label>
                <select
                  value={previewForm.lga_name}
                  onChange={(e) => updatePreviewField('lga_name', e.target.value)}
                  disabled={!previewForm.state_name}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f4f3f9] disabled:cursor-not-allowed"
                >
                  <option value="">{previewForm.state_name ? 'Select LGA…' : 'Select a state first'}</option>
                  {getLgasForState(previewForm.state_name).map((l) => (
                    <option key={l.name} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Market ID
              </label>
              <input
                value={previewForm.market_id}
                onChange={(e) => updatePreviewField('market_id', e.target.value)}
                placeholder="Market UUID (optional)"
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={previewForm.quantity}
                  onChange={(e) => updatePreviewField('quantity', Number(e.target.value))}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
                {previewErrors.quantity && <p className="text-[11px] text-[#dc2626] mt-1">{previewErrors.quantity}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  Unit
                </label>
                <select
                  value={previewForm.unit}
                  onChange={(e) => updatePreviewField('unit', e.target.value as typeof previewForm.unit)}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                >
                  {(['kg', 'tonnes', 'bags', 'units', 'litres', 'crates'] as const).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Declared Value (for ad valorem rules)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={previewForm.declared_value}
                onChange={(e) => updatePreviewField('declared_value', Number(e.target.value))}
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
              />
            </div>

            {previewApiError && (
              <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg px-4 py-3 text-[12px] text-[#dc2626]">
                {previewApiError}
              </div>
            )}

            <button
              type="submit"
              disabled={previewLoading}
              className="w-full bg-[#002366] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors disabled:opacity-60"
            >
              {previewLoading ? 'Calculating…' : 'Preview Fee Breakdown'}
            </button>
          </form>

          <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
            <h2 className="text-[14px] font-bold text-[#1a1b20] mb-4">Breakdown</h2>
            {!previewResult && (
              <p className="text-[13px] text-[#94a3b8]">Submit the form to generate a fee breakdown.</p>
            )}
            {previewResult && (
              <div className="space-y-3">
                {previewResult.levy_lines.map((line) => (
                  <div
                    key={line.authority_id}
                    className="flex items-center justify-between border-b border-[#f0f0f5] pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-[13px] text-[#1a1b20]">{line.authority_name}</p>
                      <p className="text-[11px] text-[#94a3b8] capitalize">
                        {line.authority_code} · {line.basis.replace(/_/g, ' ')} @ {formatRate(line.rate)}
                      </p>
                    </div>
                    <p className="text-[13px] font-semibold text-[#1a1b20]">{formatNGN(line.amount)}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between border-b border-[#f0f0f5] pb-2">
                  <p className="text-[13px] text-[#1a1b20]">TeMS Platform Data Fee</p>
                  <p className="text-[13px] font-semibold text-[#1a1b20]">{formatNGN(previewResult.data_fee)}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[14px] font-bold text-[#1a1b20]">Total</p>
                  <p className="text-[16px] font-bold text-[#002366]">{formatNGN(previewResult.total)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <OnboardStakeholderSlideOver open={onboardOpen} onClose={closeOnboard} onCreated={() => {}} />
      <EditRevenueRuleModal
        open={ruleModalOpen}
        rule={editingRule}
        authorities={authorities}
        onClose={closeRuleModal}
        onSaved={() => {}}
      />
    </div>
  );
}
