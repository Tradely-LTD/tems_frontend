import { useLevyConfig } from './hooks/useLevyConfig';

export default function LevyConfigSettings() {
  const {
    form,
    isEditable,
    isLoading,
    isFetching,
    isSubmitting,
    fetchError,
    submitError,
    submitSuccess,
    onSubmit,
    levyMode,
    commissionType,
  } = useLevyConfig();

  const { register, formState: { errors } } = form;

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#002366]" />
        <span className="ml-3 text-[14px] text-[#444650]">Loading…</span>
      </div>
    );
  }

  // ── Fetch error state ────────────────────────────────────────────────────────
  if (fetchError != null) {
    return (
      <div className="bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.3)] rounded p-4 text-[14px] text-[#ba1a1a]">
        Failed to load settings. Please refresh the page.
      </div>
    );
  }

  // ── Read-only view (roles without config:manage) ─────────────────────────────
  if (!isEditable) {
    const values = form.getValues();
    return (
      <div>
        <h1 className="text-[24px] font-bold text-[#1a1b20] mb-1">Levy &amp; Commission Settings</h1>
        <p className="text-[14px] text-[#444650] mb-8">Current levy and commission configuration.</p>

        <div className="bg-white border border-[#c5c6d2] rounded p-6">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex flex-col gap-0.5">
              <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">Levy Mode</dt>
              <dd className="text-[14px] text-[#1a1b20]">
                {values.levy_mode === 'flat' ? 'Flat Rate' : 'Per Category'}
              </dd>
            </div>

            <div className="flex flex-col gap-0.5">
              <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">Flat Levy Amount (₦)</dt>
              <dd className="text-[14px] text-[#1a1b20]">{values.flat_levy_amount.toLocaleString()}</dd>
            </div>

            <div className="flex flex-col gap-0.5">
              <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">Commission Type</dt>
              <dd className="text-[14px] text-[#1a1b20]">
                {values.commission_type === 'flat' ? 'Fixed Amount' : 'Percentage of Levy'}
              </dd>
            </div>

            <div className="flex flex-col gap-0.5">
              <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">Commission Amount (₦)</dt>
              <dd className="text-[14px] text-[#1a1b20]">{values.commission_flat_amount.toLocaleString()}</dd>
            </div>

            <div className="flex flex-col gap-0.5">
              <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">Commission Rate (%)</dt>
              <dd className="text-[14px] text-[#1a1b20]">{values.commission_percentage}</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  // ── Edit form (SuperAdmin and JRBAccount) ────────────────────────────────────
  return (
    <div>
      <h1 className="text-[24px] font-bold text-[#1a1b20] mb-1">Levy &amp; Commission Settings</h1>
      <p className="text-[14px] text-[#444650] mb-8">
        Configure the national levy rate and agent commission structure.
      </p>

      <form onSubmit={onSubmit} noValidate>
        {/* ── Levy Mode section ─────────────────────────────────────────────── */}
        <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-6">
          <h2 className="text-[16px] font-bold text-[#002366] uppercase tracking-wide mb-4">Levy Mode</h2>

          <div className="mb-4">
            <label className="text-[13px] font-semibold text-[#444650] block mb-1">
              Levy Mode
            </label>
            <select
              {...register('levy_mode')}
              className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
            >
              <option value="flat">Flat Rate</option>
              <option value="per_category">Per Category</option>
            </select>
            {errors.levy_mode && (
              <p className="text-[12px] text-[#ba1a1a] mt-1">{errors.levy_mode.message}</p>
            )}
          </div>

          {/* flat_levy_amount — always registered, hidden when not flat */}
          <div style={{ display: levyMode === 'flat' ? 'block' : 'none' }}>
            <label
              htmlFor="flat_levy_amount"
              className="text-[13px] font-semibold text-[#444650] block mb-1"
            >
              Flat Levy Amount (₦)
            </label>
            <input
              id="flat_levy_amount"
              type="number"
              step="0.01"
              min="0"
              {...register('flat_levy_amount', { valueAsNumber: true })}
              className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
            />
            {errors.flat_levy_amount && (
              <p className="text-[12px] text-[#ba1a1a] mt-1">{errors.flat_levy_amount.message}</p>
            )}
          </div>
        </div>

        {/* ── Agent Commission section ──────────────────────────────────────── */}
        <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-6">
          <h2 className="text-[16px] font-bold text-[#002366] uppercase tracking-wide mb-4">Agent Commission</h2>

          <div className="mb-4">
            <label className="text-[13px] font-semibold text-[#444650] block mb-1">
              Commission Type
            </label>
            <select
              {...register('commission_type')}
              className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
            >
              <option value="flat">Fixed Amount</option>
              <option value="percentage">Percentage of Levy</option>
            </select>
            {errors.commission_type && (
              <p className="text-[12px] text-[#ba1a1a] mt-1">{errors.commission_type.message}</p>
            )}
          </div>

          {/* commission_flat_amount — always registered, hidden when not flat */}
          <div style={{ display: commissionType === 'flat' ? 'block' : 'none' }}>
            <label
              htmlFor="commission_flat_amount"
              className="text-[13px] font-semibold text-[#444650] block mb-1"
            >
              Commission Amount (₦)
            </label>
            <input
              id="commission_flat_amount"
              type="number"
              step="0.01"
              min="0"
              {...register('commission_flat_amount', { valueAsNumber: true })}
              className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
            />
            {errors.commission_flat_amount && (
              <p className="text-[12px] text-[#ba1a1a] mt-1">{errors.commission_flat_amount.message}</p>
            )}
          </div>

          {/* commission_percentage — always registered, hidden when not percentage */}
          <div style={{ display: commissionType === 'percentage' ? 'block' : 'none' }}>
            <label
              htmlFor="commission_percentage"
              className="text-[13px] font-semibold text-[#444650] block mb-1"
            >
              Commission Rate (%)
            </label>
            <input
              id="commission_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('commission_percentage', { valueAsNumber: true })}
              className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
            />
            {errors.commission_percentage && (
              <p className="text-[12px] text-[#ba1a1a] mt-1">{errors.commission_percentage.message}</p>
            )}
          </div>
        </div>

        {/* ── Submit button ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#002366] text-white text-[14px] font-semibold px-6 py-2.5 rounded hover:bg-[#003399] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white inline-block" />
            )}
            Save Configuration
          </button>
        </div>

        {/* ── Success banner ────────────────────────────────────────────────── */}
        {submitSuccess && (
          <div className="mt-4 bg-[rgba(9,108,75,0.1)] border border-[#096c4b] rounded p-4 text-[14px] text-[#096c4b]">
            Settings saved successfully.
          </div>
        )}

        {/* ── Error banner ──────────────────────────────────────────────────── */}
        {submitError != null && (
          <div className="mt-4 bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.3)] rounded p-4 text-[14px] text-[#ba1a1a]">
            Failed to save settings. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}
