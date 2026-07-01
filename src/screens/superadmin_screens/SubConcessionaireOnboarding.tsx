import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { NIGERIAN_STATE_NAMES, getLgasForState } from '@/constants/nigeria';

const STEPS = ['Entity Details', 'Signatory KYC', 'Partnership Context', 'Review & Commit'];

type StepData = {
  entity: { name: string; cacNumber: string; address: string; state: string; lga: string; type: string; phone: string; email: string };
  signatory: { name: string; title: string; bvn: string; nin: string; phone: string; email: string };
  partnership: { territories: string[]; commodities: string[]; revenueSplit: string; levyScheme: string };
};

const INITIAL: StepData = {
  entity: { name: '', cacNumber: '', address: '', state: '', lga: '', type: '', phone: '', email: '' },
  signatory: { name: '', title: '', bvn: '', nin: '', phone: '', email: '' },
  partnership: { territories: [], commodities: [], revenueSplit: '', levyScheme: '' },
};

const COMMODITY_OPTIONS = ['Grains & Cereals','Livestock','Vegetables','Processed Foods','Textiles','Chemicals','Timber','Other Agric.'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex flex-col items-center`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
              i < current ? 'bg-[#096c4b] text-white' :
              i === current ? 'bg-[#002366] text-white' :
              'bg-[#e2e4ed] text-[#94a3b8]'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${i === current ? 'text-[#002366]' : 'text-[#94a3b8]'}`}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-16 sm:w-24 mb-4 mx-1 transition-all ${i < current ? 'bg-[#096c4b]' : 'bg-[#e2e4ed]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SubConcessionaireOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<StepData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  function updateEntity(patch: Partial<StepData['entity']>) {
    setData((d) => ({ ...d, entity: { ...d.entity, ...patch } }));
  }
  function updateSignatory(patch: Partial<StepData['signatory']>) {
    setData((d) => ({ ...d, signatory: { ...d.signatory, ...patch } }));
  }
  function updatePartnership(patch: Partial<StepData['partnership']>) {
    setData((d) => ({ ...d, partnership: { ...d.partnership, ...patch } }));
  }
  function toggleList(key: 'territories' | 'commodities', val: string) {
    setData((d) => {
      const list = d.partnership[key];
      return {
        ...d,
        partnership: {
          ...d.partnership,
          [key]: list.includes(val) ? list.filter((x) => x !== val) : [...list, val],
        },
      };
    });
  }

  if (submitted) {
    return (
      <div className="max-w-[600px] mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-[#e6f4ef] flex items-center justify-center mx-auto mb-4">
          <span className="text-[28px]">✓</span>
        </div>
        <h2 className="text-[20px] font-bold text-[#1a1b20]">Onboarding submitted</h2>
        <p className="text-[14px] text-[#64748b] mt-2">
          <strong>{data.entity.name}</strong> has been submitted for review. The signatory will receive a verification email.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => { setData(INITIAL); setStep(0); setSubmitted(false); }}
            className="bg-[#002366] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors"
          >
            Onboard Another
          </button>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD_NATIONAL)}
            className="bg-white border border-[#e2e4ed] text-[#1a1b20] text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#f8f9fc]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto space-y-8">
      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Sub-Concessionaire Onboarding</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Register a new concessionaire partner on the TeMS platform</p>
      </div>

      <StepIndicator current={step} />

      <div className="bg-white rounded-xl border border-[#e2e4ed] p-8">

        {/* Step 0: Entity Details */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-[16px] font-semibold text-[#1a1b20]">Entity Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Company Name *', key: 'name', placeholder: 'Full registered name' },
                { label: 'CAC Number *',   key: 'cacNumber', placeholder: 'RC-XXXXXXX' },
                { label: 'Phone *',        key: 'phone', placeholder: '+234...' },
                { label: 'Email *',        key: 'email', placeholder: 'contact@company.com' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">{f.label}</label>
                  <input
                    value={(data.entity as Record<string,string>)[f.key]}
                    onChange={(e) => updateEntity({ [f.key]: e.target.value } as Partial<StepData['entity']>)}
                    placeholder={f.placeholder}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Address *</label>
                <input
                  value={data.entity.address}
                  onChange={(e) => updateEntity({ address: e.target.value })}
                  placeholder="Full business address"
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">State *</label>
                <select
                  value={data.entity.state}
                  onChange={(e) => updateEntity({ state: e.target.value, lga: '' })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                >
                  <option value="">Select state...</option>
                  {NIGERIAN_STATE_NAMES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">LGA *</label>
                <select
                  value={data.entity.lga}
                  onChange={(e) => updateEntity({ lga: e.target.value })}
                  disabled={!data.entity.state}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f8f9fc] disabled:text-[#94a3b8]"
                >
                  <option value="">{data.entity.state ? 'Select LGA...' : 'Select a state first'}</option>
                  {getLgasForState(data.entity.state).map((l) => <option key={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Entity Type *</label>
                <select
                  value={data.entity.type}
                  onChange={(e) => updateEntity({ type: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                >
                  <option value="">Select type...</option>
                  <option>Limited Liability Company</option>
                  <option>Public Limited Company</option>
                  <option>Cooperative Society</option>
                  <option>NGO / Non-profit</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Signatory KYC */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-[16px] font-semibold text-[#1a1b20]">Signatory KYC</h2>
            <p className="text-[13px] text-[#64748b]">Details of the director or authorised signatory for this entity.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name *',  key: 'name',  placeholder: 'As on NIN slip' },
                { label: 'Title / Role *', key: 'title', placeholder: 'e.g. Managing Director' },
                { label: 'BVN *',        key: 'bvn',   placeholder: '11-digit BVN' },
                { label: 'NIN *',        key: 'nin',   placeholder: '11-digit NIN' },
                { label: 'Phone *',      key: 'phone', placeholder: '+234...' },
                { label: 'Email *',      key: 'email', placeholder: 'director@company.com' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">{f.label}</label>
                  <input
                    value={(data.signatory as Record<string,string>)[f.key]}
                    onChange={(e) => updateSignatory({ [f.key]: e.target.value } as Partial<StepData['signatory']>)}
                    placeholder={f.placeholder}
                    className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Partnership Context */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-[16px] font-semibold text-[#1a1b20]">Partnership Context</h2>
            <div>
              <label className="block text-[13px] font-medium text-[#1a1b20] mb-2">Territory Allocation (select states)</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {NIGERIAN_STATE_NAMES.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.partnership.territories.includes(s)}
                      onChange={() => toggleList('territories', s)}
                      className="w-3.5 h-3.5 accent-[#002366]"
                    />
                    <span className="text-[12px] text-[#1a1b20]">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1a1b20] mb-2">Commodity Categories</label>
              <div className="flex flex-wrap gap-2">
                {COMMODITY_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleList('commodities', c)}
                    className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
                      data.partnership.commodities.includes(c)
                        ? 'bg-[#002366] text-white border-[#002366]'
                        : 'bg-white text-[#1a1b20] border-[#c5c6d2] hover:border-[#002366]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Revenue Split (%)</label>
                <input
                  type="number"
                  min="0" max="100"
                  value={data.partnership.revenueSplit}
                  onChange={(e) => updatePartnership({ revenueSplit: e.target.value })}
                  placeholder="e.g. 30"
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Levy Scheme</label>
                <select
                  value={data.partnership.levyScheme}
                  onChange={(e) => updatePartnership({ levyScheme: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                >
                  <option value="">Select scheme...</option>
                  <option>Standard (0.5%)</option>
                  <option>Reduced (0.3%) — Livestock</option>
                  <option>Custom rate</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Commit */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-[16px] font-semibold text-[#1a1b20]">Review & Commit</h2>
            <p className="text-[13px] text-[#64748b]">Confirm all details before submitting for approval.</p>

            {[
              {
                title: 'Entity Details',
                rows: [
                  ['Company Name', data.entity.name],
                  ['CAC Number', data.entity.cacNumber],
                  ['State', data.entity.state],
                  ['LGA', data.entity.lga],
                  ['Type', data.entity.type],
                  ['Email', data.entity.email],
                ],
              },
              {
                title: 'Signatory',
                rows: [
                  ['Name', data.signatory.name],
                  ['Title', data.signatory.title],
                  ['BVN', data.signatory.bvn ? '***' + data.signatory.bvn.slice(-3) : '—'],
                  ['NIN', data.signatory.nin ? '***' + data.signatory.nin.slice(-3) : '—'],
                  ['Email', data.signatory.email],
                ],
              },
              {
                title: 'Partnership',
                rows: [
                  ['Territories', data.partnership.territories.join(', ') || '—'],
                  ['Commodities', data.partnership.commodities.join(', ') || '—'],
                  ['Revenue Split', data.partnership.revenueSplit ? `${data.partnership.revenueSplit}%` : '—'],
                  ['Levy Scheme', data.partnership.levyScheme || '—'],
                ],
              },
            ].map((section) => (
              <div key={section.title} className="border border-[#e2e4ed] rounded-lg overflow-hidden">
                <div className="bg-[#f8f9fc] px-4 py-2 border-b border-[#e2e4ed]">
                  <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wide">{section.title}</p>
                </div>
                <div className="divide-y divide-[#f1f3f9]">
                  {section.rows.map(([label, value]) => (
                    <div key={label} className="flex items-start px-4 py-2.5 gap-4">
                      <span className="text-[12px] text-[#64748b] w-32 shrink-0">{label}</span>
                      <span className="text-[12px] font-medium text-[#1a1b20]">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#e2e4ed]">
          <button
            onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}
            className="text-[13px] font-medium text-[#64748b] hover:text-[#1a1b20] transition-colors"
          >
            ← {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="bg-[#002366] text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={() => setSubmitted(true)}
                className="bg-[#096c4b] text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#065c3f] transition-colors"
              >
                Submit for Approval
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
