import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Button } from '@/components/Buttons';
import { StatusBadge, shipmentStatusToBadge } from '@/components/StatusBadge';
import { useWaybillDetail } from './hooks/useWaybillDetail';
import { useWaybillLevyLines } from './hooks/useWaybillLevyLines';
import { buildWaybillPassRoute } from '@/constants/routes';

function formatNGN(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₦0.00';
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

function DefinitionItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-[#f4f3f9] last:border-0">
      <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
        {label}
      </dt>
      <dd className="text-[14px] text-[#1a1b20]">{value ?? '—'}</dd>
    </div>
  );
}

function MonoDefinitionItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-[#f4f3f9] last:border-0">
      <dt className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]">
        {label}
      </dt>
      <dd className="text-[14px] text-[#1a1b20] font-mono">{value ?? '—'}</dd>
    </div>
  );
}

export default function WaybillDetail() {
  const navigate = useNavigate();
  const { waybillId } = useParams<{ waybillId: string }>();
  const { waybill, isLoading, error, isExpired } = useWaybillDetail(waybillId ?? '');
  const { levyLines, levyLinesLoading, levyLinesError } = useWaybillLevyLines(waybillId ?? '');

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

  const statusesNoExpiry = ['delivered', 'cancelled'];
  const showExpired =
    isExpired && !statusesNoExpiry.includes(waybill.shipment_status);

  return (
    <div>
      {/* Actions bar */}
      <div className="flex items-center gap-3 mb-6">
        <Button label="Back" variant="ghost" onClick={() => navigate(-1)} />
        <div className="flex-1" />
        <Button
          label="Print Pass"
          variant="secondary"
          onClick={() =>
            navigate(buildWaybillPassRoute(waybill.waybill_id))
          }
        />
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1a1b20]">Waybill Detail</h1>
        <p className="text-[14px] font-mono text-[#444650] mt-0.5">{waybill.waybill_id}</p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — metadata */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Status row */}
          <div className="bg-white border border-[#c5c6d2] rounded p-4 flex flex-wrap gap-3 items-center">
            <StatusBadge
              variant={shipmentStatusToBadge(waybill.shipment_status)}
              label={waybill.shipment_status.replace(/_/g, ' ').toUpperCase()}
            />
            <StatusBadge
              variant={waybill.payment_status === 'success' ? 'valid' : 'pending'}
              label={waybill.payment_status === 'success' ? 'PAID' : 'PAYMENT PENDING'}
            />
            {showExpired && <StatusBadge variant="expired" label="EXPIRED" />}
          </div>

          {/* Shipper & Consignee */}
          <div className="bg-white border border-[#c5c6d2] rounded p-4">
            <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-3">
              Shipper & Consignee
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <MonoDefinitionItem label="Shipper TeMS ID" value={waybill.shipper_tems_id} />
              <MonoDefinitionItem label="Shipper TIN" value={waybill.shipper_tin} />
              <DefinitionItem label="Consignee Name" value={waybill.consignee_name} />
              <DefinitionItem label="Consignee Phone" value={waybill.consignee_phone} />
              <MonoDefinitionItem label="Consignee TIN" value={waybill.consignee_tin} />
            </dl>
          </div>

          {/* Commodity */}
          <div className="bg-white border border-[#c5c6d2] rounded p-4">
            <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-3">
              Commodity
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <MonoDefinitionItem label="Commodity Code" value={waybill.commodity_code} />
              <DefinitionItem
                label="Declared Value"
                value={formatNGN(waybill.total_declared_value)}
              />
            </dl>
          </div>

          {/* Route */}
          <div className="bg-white border border-[#c5c6d2] rounded p-4">
            <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-3">
              Route & Transport
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <DefinitionItem label="Origin State" value={waybill.origin_state} />
              <DefinitionItem label="Origin LGA" value={waybill.origin_lga} />
              <DefinitionItem label="Origin Market" value={waybill.origin_market} />
              <DefinitionItem label="Destination State" value={waybill.destination_state} />
              <DefinitionItem label="Destination LGA" value={waybill.destination_lga} />
              <DefinitionItem label="Destination Market" value={waybill.destination_market} />
              <DefinitionItem label="Departure Date" value={waybill.departure_date} />
              <DefinitionItem label="Departure Time" value={waybill.departure_time} />
              <DefinitionItem label="Vehicle Reg No" value={waybill.vehicle_reg} />
              <DefinitionItem label="Driver Name" value={waybill.driver_name} />
              <DefinitionItem label="Driver Phone" value={waybill.driver_phone} />
              <DefinitionItem label="Channel" value={waybill.channel} />
            </dl>
          </div>

          {/* Levy */}
          <div className="bg-white border border-[#c5c6d2] rounded p-4">
            <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-3">
              Levy Breakdown
            </h2>
            {waybill.levy_breakdown?.length > 0 ? (
              <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <tbody>
                  {waybill.levy_breakdown.map((line, i) => (
                    <tr key={i} className="border-b border-[#f4f3f9] last:border-0">
                      <td className="py-1.5 text-[#1a1b20]">{line.authority_name}</td>
                      <td className="py-1.5 text-right font-mono text-[#1a1b20]">
                        {formatNGN(line.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="pt-2 text-[#002366]">Total Levy</td>
                    <td className="pt-2 text-right font-mono text-[#002366]">
                      {formatNGN(waybill.levy_total)}
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            ) : (
              <p className="text-[14px] text-[#444650]">No levy data.</p>
            )}
          </div>

          {/* Revenue Authority Disbursement (new per-authority breakdown) */}
          <div className="bg-white border border-[#c5c6d2] rounded p-4">
            <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-3">
              Revenue Authority Disbursement
            </h2>
            {levyLinesError && (
              <p className="text-[14px] text-[#D83B01]">Failed to load disbursement breakdown.</p>
            )}
            {!levyLinesError && levyLinesLoading && (
              <p className="text-[14px] text-[#444650]">Loading disbursement breakdown...</p>
            )}
            {!levyLinesError && !levyLinesLoading && levyLines.length === 0 && (
              <p className="text-[14px] text-[#444650]">No disbursement lines recorded for this waybill.</p>
            )}
            {!levyLinesError && !levyLinesLoading && levyLines.length > 0 && (
              <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-[#c5c6d2]">
                    <th className="px-2 py-2 text-left text-[11px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                      Authority
                    </th>
                    <th className="px-2 py-2 text-right text-[11px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                      Amount
                    </th>
                    <th className="px-2 py-2 text-left text-[11px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {levyLines.map((line) => (
                    <tr key={line.id} className="border-b border-[#f4f3f9] last:border-0">
                      <td className="py-1.5 text-[#1a1b20]">
                        {line.authority_name} <span className="text-[#94a3b8]">({line.authority_code})</span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-[#1a1b20]">{formatNGN(line.amount)}</td>
                      <td className="py-1.5 text-[#444650] capitalize">{line.disb_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {/* Products */}
          {waybill.products && waybill.products.length > 0 && (
            <div className="bg-white border border-[#c5c6d2] rounded p-4">
              <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-3">
                Products
              </h2>
              <div className="overflow-x-auto">
                <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#c5c6d2]">
                      <th className="px-2 py-2 text-left text-[11px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                        Product
                      </th>
                      <th className="px-2 py-2 text-left text-[11px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                        Code
                      </th>
                      <th className="px-2 py-2 text-left text-[11px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                        Qty / Unit
                      </th>
                      <th className="px-2 py-2 text-right text-[11px] font-bold tracking-[0.05em] uppercase text-[#444650]">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {waybill.products.map((p, i) => (
                      <tr
                        key={p.id ?? i}
                        className={i % 2 === 0 ? 'bg-white' : 'bg-[#faf8ff]'}
                      >
                        <td className="px-2 py-2 text-[#1a1b20]">{p.description}</td>
                        <td className="px-2 py-2 font-mono text-[#1a1b20]">
                          {p.commodity_code}
                        </td>
                        <td className="px-2 py-2 text-[#1a1b20]">
                          {p.quantity} {p.unit}
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-[#1a1b20]">
                          {formatNGN(p.declared_total_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white border border-[#c5c6d2] rounded p-4">
            <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide mb-3">
              Timeline
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <DefinitionItem label="Created" value={new Date(waybill.created_at).toLocaleString()} />
              <DefinitionItem label="Updated" value={new Date(waybill.updated_at).toLocaleString()} />
              <DefinitionItem
                label="Expires"
                value={new Date(waybill.expires_at).toLocaleString()}
              />
              {waybill.cancelled_at && (
                <DefinitionItem
                  label="Cancelled"
                  value={new Date(waybill.cancelled_at).toLocaleString()}
                />
              )}
              {waybill.cancel_reason && (
                <DefinitionItem label="Cancel Reason" value={waybill.cancel_reason} />
              )}
              {waybill.disputed_at && (
                <DefinitionItem
                  label="Disputed"
                  value={new Date(waybill.disputed_at).toLocaleString()}
                />
              )}
              {waybill.dispute_reason && (
                <DefinitionItem label="Dispute Reason" value={waybill.dispute_reason} />
              )}
            </dl>
          </div>
        </div>

        {/* Right — QR card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#c5c6d2] rounded p-6 flex flex-col items-center gap-4 sticky top-4">
            <h2 className="text-[14px] font-bold text-[#002366] uppercase tracking-wide self-start">
              Waybill QR Code
            </h2>

            {waybill.qr_payload ? (
              <div className="bg-white p-4" style={{ lineHeight: 0 }}>
                <QRCode value={waybill.qr_payload} size={200} />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] bg-[#f4f3f9] flex items-center justify-center rounded">
                <span className="text-[12px] text-[#444650] text-center px-4">
                  QR code not yet generated
                </span>
              </div>
            )}

            {/* Trust tokens */}
            {waybill.payment_status === 'success' && (
              <div className="bg-[#096c4b] text-white text-[12px] font-bold tracking-wide uppercase px-4 py-2 rounded-[8px]">
                PAID IN FULL
              </div>
            )}
            {showExpired && (
              <div className="bg-[rgba(186,26,26,0.15)] text-[#ba1a1a] text-[12px] font-bold tracking-wide uppercase px-4 py-2 rounded-[8px]">
                EXPIRED
              </div>
            )}

            <div className="w-full pt-3 border-t border-[#f4f3f9]">
              <p className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#444650] mb-1">
                Expires
              </p>
              <p className="text-[13px] text-[#1a1b20]">
                {new Date(waybill.expires_at).toLocaleDateString()}
              </p>
            </div>

            <Button
              label="Print Pass"
              variant="primary"
              fullWidth
              onClick={() => navigate(buildWaybillPassRoute(waybill.waybill_id))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
