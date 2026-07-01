import { useOnboardStakeholder } from './hooks/useOnboardStakeholder';
import { AUTHORITY_TIERS, STAKEHOLDER_TYPES, SETTLEMENT_TYPES } from './schema/revenueAuthorityValidationSchema';
import type { RevenueAuthority } from './services/types';

interface OnboardStakeholderSlideOverProps {
  open: boolean;
  onClose: () => void;
  onCreated: (authority: RevenueAuthority) => void;
}

export default function OnboardStakeholderSlideOver({ open, onClose, onCreated }: OnboardStakeholderSlideOverProps) {
  const {
    form,
    updateField,
    errors,
    apiError,
    creating,
    handleSubmit,
    createdAuthority,
    reset,
    contactUserId,
    setContactUserId,
    contactRole,
    setContactRole,
    contactError,
    contacts,
    addingContact,
    handleAddContact,
    handleRemoveContact,
    contactsAtMax,
    handleVerifyBank,
    verifying,
  } = useOnboardStakeholder(onCreated);

  if (!open) return null;

  function handleClose() {
    reset();
    onClose();
  }

  const hasBankDetails = Boolean(form.bank_code && form.account_number);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      <div className="bg-white h-full w-full max-w-[560px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#e2e4ed] bg-[#f8f9fc]">
          <div>
            <p className="text-[16px] font-bold text-[#1a1b20]">Onboard Revenue Stakeholder</p>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Create a new revenue authority and assign up to 2 admin contacts.
            </p>
          </div>
          <button onClick={handleClose} className="text-[#94a3b8] hover:text-[#1a1b20] text-[22px] leading-none mt-0.5">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {!createdAuthority ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg px-4 py-3 text-[12px] text-[#dc2626]">
                  {apiError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    Authority Code *
                  </label>
                  <input
                    value={form.authority_code}
                    onChange={(e) => updateField('authority_code', e.target.value)}
                    placeholder="e.g. KN-LGA-001"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                  {errors.authority_code && <p className="text-[11px] text-[#dc2626] mt-1">{errors.authority_code}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    Authority Name *
                  </label>
                  <input
                    value={form.authority_name}
                    onChange={(e) => updateField('authority_name', e.target.value)}
                    placeholder="e.g. Kano LGA Trade Office"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                  {errors.authority_name && <p className="text-[11px] text-[#dc2626] mt-1">{errors.authority_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    Tier *
                  </label>
                  <select
                    value={form.tier}
                    onChange={(e) => updateField('tier', e.target.value as typeof form.tier)}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white capitalize focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  >
                    {AUTHORITY_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    Stakeholder Type *
                  </label>
                  <select
                    value={form.stakeholder_type}
                    onChange={(e) => updateField('stakeholder_type', e.target.value as typeof form.stakeholder_type)}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white capitalize focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  >
                    {STAKEHOLDER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    Settlement Type
                  </label>
                  <select
                    value={form.settlement_type}
                    onChange={(e) => updateField('settlement_type', e.target.value as typeof form.settlement_type)}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white capitalize focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  >
                    {SETTLEMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    State
                  </label>
                  <input
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="e.g. Kano"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    LGA
                  </label>
                  <input
                    value={form.lga}
                    onChange={(e) => updateField('lga', e.target.value)}
                    placeholder="e.g. Dawakin Tofa"
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                </div>
              </div>

              <div className="border-t border-[#e2e4ed] pt-4">
                <p className="text-[12px] font-bold uppercase tracking-wide text-[#64748b] mb-3">
                  Settlement Bank Details (optional at onboarding)
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                      Bank Name
                    </label>
                    <input
                      value={form.bank_name}
                      onChange={(e) => updateField('bank_name', e.target.value)}
                      placeholder="e.g. First Bank"
                      className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                      Bank Code
                    </label>
                    <input
                      value={form.bank_code}
                      onChange={(e) => updateField('bank_code', e.target.value)}
                      placeholder="e.g. 011"
                      maxLength={10}
                      className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                    />
                    {errors.bank_code && <p className="text-[11px] text-[#dc2626] mt-1">{errors.bank_code}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                    Account Number
                  </label>
                  <input
                    value={form.account_number}
                    onChange={(e) => updateField('account_number', e.target.value)}
                    placeholder="10-digit NUBAN"
                    maxLength={10}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                  {errors.account_number && <p className="text-[11px] text-[#dc2626] mt-1">{errors.account_number}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#f8f8fb] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#002366] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors disabled:opacity-60"
                >
                  {creating ? 'Creating…' : 'Create Authority'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#e6f4ef] border border-[#096c4b] rounded-lg px-4 py-3 text-[12px] text-[#096c4b]">
                Authority "{createdAuthority.authority_name}" created successfully.
              </div>

              {/* Bank verification */}
              {hasBankDetails && (
                <div className="bg-[#f8f9fc] border border-[#e2e4ed] rounded-lg p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-[#64748b] mb-2">Bank Verification</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        createdAuthority.nibss_verified
                          ? 'bg-[#e6f4ef] text-[#096c4b]'
                          : 'bg-[#fdf8e3] text-[#92400e]'
                      }`}
                    >
                      {createdAuthority.nibss_verified ? 'Verified' : 'Not verified'}
                    </span>
                    {!createdAuthority.nibss_verified && (
                      <button
                        onClick={handleVerifyBank}
                        disabled={verifying}
                        className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#002366] text-[#002366] hover:bg-[#e8edf7] disabled:opacity-50"
                      >
                        {verifying ? 'Verifying…' : 'Verify Bank Details'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Contacts */}
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wide text-[#64748b] mb-2">
                  Admin Contacts ({contacts.length}/2)
                </p>
                {contactError && (
                  <p className="text-[11px] text-[#dc2626] mb-2 bg-[#fef2f2] px-3 py-2 rounded-lg">{contactError}</p>
                )}
                <div className="space-y-2 mb-3">
                  {contacts.map((c) => (
                    <div
                      key={c.userId}
                      className="flex items-center justify-between bg-white border border-[#e2e4ed] rounded-lg px-3 py-2"
                    >
                      <div className="text-[12px]">
                        <span className="font-mono text-[#1a1b20]">{c.userId}</span>
                        <span className="ml-2 bg-[#e8edf7] text-[#002366] text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize">
                          {c.role}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveContact(c.userId)}
                        className="text-[11px] text-[#dc2626] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-[12px] text-[#94a3b8]">No contacts assigned yet.</p>
                  )}
                </div>

                {!contactsAtMax && (
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                        User ID
                      </label>
                      <input
                        value={contactUserId}
                        onChange={(e) => setContactUserId(e.target.value)}
                        placeholder="User UUID"
                        className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">
                        Role
                      </label>
                      <select
                        value={contactRole}
                        onChange={(e) => setContactRole(e.target.value as typeof contactRole)}
                        className="border border-[#c5c6d2] rounded-lg px-3 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                      >
                        <option value="primary">Primary</option>
                        <option value="backup">Backup</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddContact}
                      disabled={addingContact}
                      className="bg-[#002366] text-white text-[12px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d] disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-[#002366] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
