import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Buttons';
import { useWizard } from './WizardContext';
import {
  useCalculateLevyMutation,
  useCreateWaybillMutation,
  useInitiatePaymentMutation,
} from '../services/waybillSlice';
import { buildWaybillPassRoute } from '@/constants/routes';
import type { LevyLine } from '../services/types';

function formatNGN(value: number): string {
  return '₦' + value.toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[#f4f3f9] last:border-0">
      <span className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
        {label}
      </span>
      <span className="text-[13px] text-[#1a1b20] text-right max-w-[60%]">{value ?? '—'}</span>
    </div>
  );
}

export default function Step4Payment() {
  const navigate = useNavigate();
  const { data, goBack } = useWizard();

  const [calculateLevy, { isLoading: levyLoading }] = useCalculateLevyMutation();
  const [createWaybill, { isLoading: creating }] = useCreateWaybillMutation();
  const [initiatePayment, { isLoading: paymentLoading }] = useInitiatePaymentMutation();

  const [levyLines, setLevyLines] = useState<LevyLine[]>([]);
  const [levyTotal, setLevyTotal] = useState<number>(0);
  const [levyError, setLevyError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const totalDeclaredValue = data.step2.products.reduce(
    (sum, p) => sum + (p.declared_total_value || 0),
    0
  );

  useEffect(() => {
    async function fetchLevy() {
      if (!data.step1.commodity_code) return;
      setLevyError(null);
      try {
        const res = await calculateLevy({
          commodity_code: data.step1.commodity_code,
          quantity: data.step2.products.reduce((s, p) => s + (p.quantity || 0), 0),
          unit: data.step2.products[0]?.unit ?? 'kg',
          declared_value: totalDeclaredValue,
        }).unwrap();
        setLevyLines(res.data.levy_lines);
        setLevyTotal(res.data.total);
      } catch {
        setLevyError('Failed to calculate levy. You can still proceed.');
      }
    }
    fetchLevy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePay() {
    setCreateError(null);
    try {
      // Step 1: Create waybill
      const waybillRes = await createWaybill({
        shipper_tems_id: data.step1.shipper_tems_id || undefined,
        shipper_tin: data.step1.shipper_tin || undefined,
        consignee_name: data.step1.consignee_name || undefined,
        consignee_phone: data.step1.consignee_phone || undefined,
        consignee_tin: data.step1.consignee_tin || undefined,
        commodity_code: data.step1.commodity_code,
        total_declared_value: totalDeclaredValue,
        departure_date: data.step3.departure_date,
        departure_time: data.step3.departure_time || undefined,
        origin_state: data.step3.origin_state,
        origin_lga: data.step3.origin_lga,
        origin_market: data.step3.origin_market || undefined,
        destination_state: data.step3.destination_state,
        destination_lga: data.step3.destination_lga,
        destination_market: data.step3.destination_market || undefined,
        vehicle_reg: data.step3.vehicle_reg,
        driver_name: data.step3.driver_name || undefined,
        driver_phone: data.step3.driver_phone || undefined,
        levy_total: levyTotal,
        levy_breakdown: levyLines,
        channel: 'agent_web',
        products: data.step2.products.map((p) => ({
          description: p.description,
          commodity_code: p.commodity_code,
          quantity: p.quantity,
          unit: p.unit,
          weight_kg: p.weight_kg,
          declared_unit_value: p.declared_unit_value,
          declared_total_value: p.declared_total_value,
        })),
      }).unwrap();

      const newWaybillId = waybillRes.data.waybill_id;

      // Step 2: Initiate payment
      try {
        const payRes = await initiatePayment({ waybill_id: newWaybillId }).unwrap();
        window.open(payRes.data.authorization_url, '_blank');
      } catch {
        // Payment initiation failure is non-blocking — waybill was created
      }

      // Navigate to pass regardless
      navigate(buildWaybillPassRoute(newWaybillId));
    } catch {
      setCreateError('Failed to create waybill. Please try again.');
    }
  }

  return (
    <div>
      <h2 className="text-[18px] font-semibold text-[#1a1b20] mb-6">
        Payment & Review
      </h2>

      {/* Review: Step 1 */}
      <div className="bg-[#faf8ff] border border-[#c5c6d2] rounded p-4 mb-4">
        <h3 className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#002366] mb-3">
          Shipper & Commodity
        </h3>
        <ReviewRow label="Shipper TeMS ID" value={data.step1.shipper_tems_id} />
        <ReviewRow label="Shipper TIN" value={data.step1.shipper_tin} />
        <ReviewRow label="Consignee Name" value={data.step1.consignee_name} />
        <ReviewRow label="Consignee Phone" value={data.step1.consignee_phone} />
        <ReviewRow label="Commodity Code" value={data.step1.commodity_code} />
        <ReviewRow label="Description" value={data.step1.commodity_description} />
      </div>

      {/* Review: Step 2 */}
      <div className="bg-[#faf8ff] border border-[#c5c6d2] rounded p-4 mb-4">
        <h3 className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#002366] mb-3">
          Products ({data.step2.products.length})
        </h3>
        {data.step2.products.map((p, i) => (
          <div key={i} className="mb-3 last:mb-0">
            <p className="text-[13px] font-semibold text-[#1a1b20] mb-1">
              {i + 1}. {p.description}
            </p>
            <ReviewRow label="Code" value={p.commodity_code} />
            <ReviewRow label="Qty / Unit" value={`${p.quantity} ${p.unit}`} />
            <ReviewRow label="Total Value" value={formatNGN(p.declared_total_value)} />
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-[#c5c6d2] flex justify-between">
          <span className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
            Total Declared Value
          </span>
          <span className="text-[13px] font-bold text-[#1a1b20]">
            {formatNGN(totalDeclaredValue)}
          </span>
        </div>
      </div>

      {/* Review: Step 3 */}
      <div className="bg-[#faf8ff] border border-[#c5c6d2] rounded p-4 mb-4">
        <h3 className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#002366] mb-3">
          Route & Vehicle
        </h3>
        <ReviewRow
          label="Route"
          value={`${data.step3.origin_state} → ${data.step3.destination_state}`}
        />
        <ReviewRow
          label="Origin LGA"
          value={data.step3.origin_lga}
        />
        <ReviewRow
          label="Destination LGA"
          value={data.step3.destination_lga}
        />
        <ReviewRow label="Departure" value={data.step3.departure_date} />
        <ReviewRow label="Vehicle Reg" value={data.step3.vehicle_reg} />
        <ReviewRow label="Driver" value={data.step3.driver_name} />
      </div>

      {/* Levy Breakdown */}
      <div className="bg-white border border-[#c5c6d2] rounded p-4 mb-6">
        <h3 className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#002366] mb-3">
          Levy Calculation
        </h3>
        {levyLoading ? (
          <div className="flex items-center gap-2 text-[14px] text-[#444650]">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Calculating levy...
          </div>
        ) : levyError ? (
          <p className="text-[13px] text-[#D83B01]">{levyError}</p>
        ) : levyLines.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <tbody>
              {levyLines.map((line, i) => (
                <tr key={i} className="border-b border-[#f4f3f9] last:border-0">
                  <td className="py-1.5 text-[#1a1b20]">{line.authority_name}</td>
                  <td className="py-1.5 text-right font-mono text-[#1a1b20]">
                    {formatNGN(line.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p className="text-[13px] text-[#444650]">No levy breakdown available.</p>
        )}

        {levyTotal > 0 && (
          <div className="mt-3 pt-3 border-t border-[#c5c6d2] flex justify-between items-center">
            <span className="text-[14px] font-bold text-[#002366]">Total Levy</span>
            <span className="text-[20px] font-bold font-mono text-[#002366]">
              {formatNGN(levyTotal)}
            </span>
          </div>
        )}
      </div>

      {createError && (
        <div className="mb-4 p-3 bg-[rgba(186,26,26,0.1)] border border-[#ba1a1a] rounded text-[14px] text-[#ba1a1a]">
          {createError}
          <button
            className="ml-3 underline font-medium"
            onClick={handlePay}
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex justify-between">
        <Button label="Back" variant="ghost" onClick={goBack} />
        <Button
          label="Pay Now"
          variant="primary"
          loading={creating || paymentLoading}
          onClick={handlePay}
        />
      </div>
    </div>
  );
}
