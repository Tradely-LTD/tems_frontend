import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/Buttons';
import { useWaybillDetail } from './hooks/useWaybillDetail';
import WaybillReceipt, { PRINT_PRESETS, type PrintConfig } from './WaybillReceipt';

const DEFAULT_CONFIG = PRINT_PRESETS.find((p) => p.label === '80mm')!;

export default function WaybillPass() {
  const navigate = useNavigate();
  const { waybillId } = useParams<{ waybillId: string }>();
  const { waybill, isLoading, error } = useWaybillDetail(waybillId ?? '');

  const [config, setConfig]         = useState<PrintConfig>(DEFAULT_CONFIG);
  const [customMm, setCustomMm]     = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    pageStyle: `
      @page {
        size: ${config.widthMm}mm ${config.widthMm >= 140 ? config.heightMm + 'mm' : 'auto'};
        margin: ${config.marginMm}mm;
      }
      body { margin: 0; }
    `,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[14px] text-[#444650]">Loading waybill...</div>
      </div>
    );
  }

  if (error || !waybill) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[16px] text-[#D83B01] font-semibold">Waybill not found.</p>
        <Button label="Go Back" variant="ghost" onClick={() => navigate(-1)} />
      </div>
    );
  }

  function selectPreset(preset: PrintConfig) {
    setConfig(preset);
    setShowCustom(false);
    setCustomMm('');
  }

  function applyCustom() {
    const mm = parseFloat(customMm);
    if (isNaN(mm) || mm < 40 || mm > 420) return;
    const marginMm = mm < 70 ? 2 : mm < 100 ? 3 : mm < 160 ? 10 : 15;
    const heightMm = mm < 100 ? 240 : mm < 160 ? 210 : 297;
    setConfig({ label: `${mm}mm`, widthMm: mm, heightMm, marginMm });
  }

  return (
    <div className="min-h-screen bg-[#f4f3f9] py-8 px-4">

      {/* ── Controls (hidden when printing) ── */}
      <div className="print:hidden flex flex-col gap-3 mb-6 max-w-3xl mx-auto">

        {/* Row 1 */}
        <div className="flex items-center gap-3">
          <Button label="Back" variant="ghost" onClick={() => navigate(-1)} />
          <div className="flex-1" />
          <Button label="Print" variant="primary" onClick={() => handlePrint()} />
        </div>

        {/* Row 2: paper size */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[#444650] font-semibold uppercase tracking-wide mr-1">
            Paper:
          </span>
          {PRINT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => selectPreset(preset)}
              className={`h-7 px-3 text-[12px] font-medium rounded border transition-colors ${
                !showCustom && config.label === preset.label
                  ? 'bg-[#002366] text-white border-[#002366]'
                  : 'border-[#c5c6d2] text-[#444650] hover:border-[#002366]'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom((v) => !v)}
            className={`h-7 px-3 text-[12px] font-medium rounded border transition-colors ${
              showCustom
                ? 'bg-[#002366] text-white border-[#002366]'
                : 'border-[#c5c6d2] text-[#444650] hover:border-[#002366]'
            }`}
          >
            Custom
          </button>
          {showCustom && (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={40}
                max={420}
                placeholder="e.g. 72"
                value={customMm}
                onChange={(e) => setCustomMm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
                className="h-7 w-20 px-2 text-[12px] border border-[#c5c6d2] rounded focus:outline-none focus:border-[#002366]"
              />
              <span className="text-[11px] text-[#444650]">mm</span>
              <button
                onClick={applyCustom}
                className="h-7 px-2 text-[12px] font-medium text-white bg-[#002366] rounded"
              >
                Apply
              </button>
            </div>
          )}
          <span className="ml-auto text-[11px] text-[#444650]">
            {config.widthMm} × {config.widthMm < 140 ? 'auto' : config.heightMm} mm
          </span>
        </div>
      </div>

      {/* ── Receipt preview ── */}
      <div className="overflow-x-auto flex justify-center">
        <WaybillReceipt ref={receiptRef} waybill={waybill} config={config} />
      </div>

    </div>
  );
}
