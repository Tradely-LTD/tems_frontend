import { useState, useMemo } from 'react';
import { useGetMyAgentProfileQuery, usePatchMyProfileMutation, useTopupWalletMutation } from './services/agentSlice';
import AgentProfileScreen from './AgentProfileScreen';
import type { PatchAgentRequest } from './services/types';
import { NIGERIAN_STATE_NAMES, getLgasForState } from '@/constants/nigeria';

export default function AgentProfileContainer() {
  const { data, isLoading, isError, error, refetch } = useGetMyAgentProfileQuery();
  const isNotFound = isError && (error as { status?: number } | undefined)?.status === 404;
  const [patchProfile, { isLoading: saving }]  = usePatchMyProfileMutation();
  const [topupWallet,  { isLoading: topping }] = useTopupWalletMutation();

  const [editMode, setEditMode]   = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupMsg, setTopupMsg]   = useState('');
  const [saveError, setSaveError] = useState('');
  const [editForm, setEditForm]   = useState<PatchAgentRequest>({});

  const profile = data?.data ?? null;

  const editLgaOptions = useMemo(() => getLgasForState(editForm.state), [editForm.state]);

  function openEdit() {
    if (!profile) return;
    setEditForm({
      first_name:  profile.first_name  ?? '',
      last_name:   profile.last_name   ?? '',
      middle_name: profile.middle_name ?? '',
      phone:       profile.phone       ?? '',
      address:     profile.address     ?? '',
      state:       profile.state       ?? '',
      lga:         profile.lga         ?? '',
      dob:         profile.dob         ?? '',
      bank_name:   profile.bank_name   ?? '',
      bank_code:   profile.bank_code   ?? '',
    });
    setSaveError('');
    setEditMode(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');
    try {
      await patchProfile(editForm).unwrap();
      setEditMode(false);
      refetch();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setSaveError(e?.data?.message ?? 'Failed to save changes');
    }
  }

  async function handleTopup(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0) { setTopupMsg('Enter a valid amount'); return; }
    try {
      const result = await topupWallet({ amount }).unwrap();
      setTopupMsg(`Wallet topped up! New balance: ₦${parseFloat(result.data.float_balance).toLocaleString('en-NG')}`);
      setTopupAmount('');
      refetch();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setTopupMsg(e?.data?.message ?? 'Top-up failed');
    }
  }

  if (editMode && profile) {
    return (
      <div className="max-w-[720px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditMode(false)} className="text-[#64748b] hover:text-[#1a1b20] text-[12px]">← Back</button>
          <h1 className="text-[22px] font-bold text-[#1a1b20]">Edit Profile</h1>
        </div>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="bg-white border border-[#c5c6d2] rounded-xl p-6">
            <h2 className="text-[13px] font-bold text-[#002366] uppercase tracking-wide mb-4">Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {([
                ['first_name',  'First Name'],
                ['last_name',   'Last Name'],
                ['middle_name', 'Middle Name'],
                ['phone',       'Phone'],
                ['dob',         'Date of Birth'],
              ] as [keyof PatchAgentRequest, string][]).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">{label}</label>
                  <input
                    value={(editForm[field] as string) ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Address</label>
                <input
                  value={(editForm.address as string) ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">State</label>
                <select
                  value={(editForm.state as string) ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value, lga: '' })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                >
                  <option value="">Select state…</option>
                  {NIGERIAN_STATE_NAMES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">LGA</label>
                <select
                  value={(editForm.lga as string) ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, lga: e.target.value })}
                  disabled={!editForm.state}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f8f9fc] disabled:text-[#94a3b8]"
                >
                  <option value="">{editForm.state ? 'Select LGA…' : 'Select a state first'}</option>
                  {editLgaOptions.map((l) => (
                    <option key={l.name} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#c5c6d2] rounded-xl p-6">
            <h2 className="text-[13px] font-bold text-[#002366] uppercase tracking-wide mb-4">Banking</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Bank Name</label>
                <input
                  value={(editForm.bank_name as string) ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Bank Code</label>
                <input
                  value={(editForm.bank_code as string) ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, bank_code: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
            </div>
          </div>

          {saveError && (
            <p className="text-[12px] text-[#dc2626] bg-[#fee2e2] px-4 py-2.5 rounded-lg">{saveError}</p>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditMode(false)} className="text-[13px] font-medium text-[#64748b] px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#002366] text-white text-[13px] font-semibold px-6 py-2 rounded-lg hover:bg-[#001a4d] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* Action bar */}
      {profile && !isLoading && (
        <div className="max-w-[720px] mx-auto mb-4 flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowTopup(!showTopup); setTopupMsg(''); }}
              className="bg-[#fdf8e3] border border-[#D4AF37] text-[#856e0e] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#fef3c7] transition-colors"
            >
              Top Up Wallet
            </button>
            <button
              onClick={openEdit}
              className="bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* Topup panel */}
      {showTopup && (
        <div className="max-w-[720px] mx-auto mb-4">
          <div className="bg-[#fdf8e3] border border-[#D4AF37] rounded-xl p-5">
            <p className="text-[13px] font-semibold text-[#856e0e] mb-3">Top Up Float Wallet</p>
            <form onSubmit={handleTopup} className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[13px] font-medium">₦</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border border-[#D4AF37] rounded-lg pl-7 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={topping}
                className="bg-[#D4AF37] text-[#1a1b20] text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#c9a22f] disabled:opacity-50"
              >
                {topping ? 'Processing…' : 'Add Funds'}
              </button>
              <button type="button" onClick={() => { setShowTopup(false); setTopupMsg(''); }}
                className="text-[#94a3b8] hover:text-[#1a1b20] text-[13px]">Cancel</button>
            </form>
            {topupMsg && (
              <p className={`mt-2 text-[12px] font-medium ${topupMsg.includes('failed') || topupMsg.includes('valid') ? 'text-[#dc2626]' : 'text-[#096c4b]'}`}>
                {topupMsg}
              </p>
            )}
          </div>
        </div>
      )}

      <AgentProfileScreen
        profile={profile}
        isLoading={isLoading}
        isError={isError && !isNotFound}
      />
    </div>
  );
}
