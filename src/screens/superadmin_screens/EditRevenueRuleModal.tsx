import { useEditRevenueRule } from './hooks/useEditRevenueRule';
import { RULE_SCOPES, RULE_BASES, RULE_STATUSES } from './schema/revenueRuleValidationSchema';
import type { RevenueAuthority, RevenueRule } from './services/types';

interface EditRevenueRuleModalProps {
  open: boolean;
  rule: RevenueRule | null;
  authorities: RevenueAuthority[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditRevenueRuleModal({
  open,
  rule,
  authorities,
  onClose,
  onSaved,
}: EditRevenueRuleModalProps) {
  const { form, updateField, errors, apiError, isSubmitting, isEditMode, handleSubmit } = useEditRevenueRule({
    rule,
    onSaved: () => {
      onSaved();
      onClose();
    },
  });

  if (!open) return null;

  const showStateField = ['state', 'lga', 'market'].includes(form.scope);
  const showLgaField = ['lga', 'market'].includes(form.scope);
  const showMarketField = form.scope === 'market';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e4ed] sticky top-0 bg-white">
          <div>
            <h2 className="text-[16px] font-bold text-[#1a1b20]">
              {isEditMode ? 'Edit Revenue Rule' : 'New Revenue Rule'}
            </h2>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              {isEditMode
                ? 'Update rate, effective dates, status, or notes.'
                : 'Define a fee rule scoped to global, state, LGA, or market.'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1a1b20] text-[20px] leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg px-4 py-3 text-[12px] text-[#dc2626]">
              {apiError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
              Authority *
            </label>
            <select
              value={form.authority_id}
              onChange={(e) => updateField('authority_id', e.target.value)}
              disabled={isEditMode}
              className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f4f3f9] disabled:cursor-not-allowed"
            >
              <option value="">Select an authority…</option>
              {authorities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.authority_name} ({a.authority_code})
                </option>
              ))}
            </select>
            {errors.authority_id && <p className="text-[11px] text-[#dc2626] mt-1">{errors.authority_id}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Scope *
              </label>
              <select
                value={form.scope}
                onChange={(e) => updateField('scope', e.target.value as typeof form.scope)}
                disabled={isEditMode}
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white capitalize focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f4f3f9] disabled:cursor-not-allowed"
              >
                {RULE_SCOPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.scope && <p className="text-[11px] text-[#dc2626] mt-1">{errors.scope}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Basis *
              </label>
              <select
                value={form.basis}
                onChange={(e) => updateField('basis', e.target.value as typeof form.basis)}
                disabled={isEditMode}
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f4f3f9] disabled:cursor-not-allowed"
              >
                {RULE_BASES.map((b) => (
                  <option key={b} value={b}>
                    {b.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(showStateField || showLgaField || showMarketField) && (
            <div className="grid grid-cols-2 gap-4">
              {showStateField && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    State {showStateField && '*'}
                  </label>
                  <input
                    value={form.state_name}
                    onChange={(e) => updateField('state_name', e.target.value)}
                    disabled={isEditMode}
                    placeholder="e.g. Kano"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f4f3f9] disabled:cursor-not-allowed"
                  />
                  {errors.state_name && <p className="text-[11px] text-[#dc2626] mt-1">{errors.state_name}</p>}
                </div>
              )}
              {showLgaField && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    LGA *
                  </label>
                  <input
                    value={form.lga_name}
                    onChange={(e) => updateField('lga_name', e.target.value)}
                    disabled={isEditMode}
                    placeholder="e.g. Dawakin Tofa"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f4f3f9] disabled:cursor-not-allowed"
                  />
                  {errors.lga_name && <p className="text-[11px] text-[#dc2626] mt-1">{errors.lga_name}</p>}
                </div>
              )}
            </div>
          )}

          {showMarketField && (
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Market ID *
              </label>
              <input
                value={form.market_id}
                onChange={(e) => updateField('market_id', e.target.value)}
                disabled={isEditMode}
                placeholder="Market UUID"
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f4f3f9] disabled:cursor-not-allowed"
              />
              {errors.market_id && <p className="text-[11px] text-[#dc2626] mt-1">{errors.market_id}</p>}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
              Commodity Code (optional — blank applies to all commodities)
            </label>
            <input
              value={form.commodity_code}
              onChange={(e) => updateField('commodity_code', e.target.value)}
              disabled={isEditMode}
              placeholder="e.g. MAIZE"
              className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f4f3f9] disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Rate *
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={form.rate}
                onChange={(e) => updateField('rate', Number(e.target.value))}
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
              />
              {errors.rate && <p className="text-[11px] text-[#dc2626] mt-1">{errors.rate}</p>}
            </div>
            {isEditMode && (
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value as typeof form.status)}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white capitalize focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                >
                  {RULE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Effective From *
              </label>
              <input
                type="datetime-local"
                value={form.effective_from}
                onChange={(e) => updateField('effective_from', e.target.value)}
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
              />
              {errors.effective_from && <p className="text-[11px] text-[#dc2626] mt-1">{errors.effective_from}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                Effective To (optional)
              </label>
              <input
                type="datetime-local"
                value={form.effective_to}
                onChange={(e) => updateField('effective_to', e.target.value)}
                className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#f8f8fb] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#002366] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
