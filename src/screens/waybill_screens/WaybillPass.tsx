import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Button } from '@/components/Buttons';
import { useWaybillDetail } from './hooks/useWaybillDetail';
import './WaybillPass.css';

type PageSize = 'a4' | 'a5';

export default function WaybillPass() {
  const navigate = useNavigate();
  const { waybillId } = useParams<{ waybillId: string }>();
  const { waybill, isLoading, error } = useWaybillDetail(waybillId ?? '');
  const [pageSize, setPageSize] = useState<PageSize>('a5');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[14px] text-[#444650]">Loading pass...</div>
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

  const isPaid = waybill.payment_status === 'success';

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col items-center py-8 px-4">
      {/* Print controls */}
      <div className="print-hidden flex items-center gap-3 mb-6 w-full max-w-md">
        <Button label="Back" variant="ghost" onClick={() => navigate(-1)} />
        <div className="flex-1" />
        <button
          onClick={() => setPageSize('a4')}
          className={`h-8 px-3 text-[13px] font-medium rounded border transition-colors ${
            pageSize === 'a4'
              ? 'bg-[#002366] text-white border-[#002366]'
              : 'border-[#c5c6d2] text-[#444650]'
          }`}
        >
          A4
        </button>
        <button
          onClick={() => setPageSize('a5')}
          className={`h-8 px-3 text-[13px] font-medium rounded border transition-colors ${
            pageSize === 'a5'
              ? 'bg-[#002366] text-white border-[#002366]'
              : 'border-[#c5c6d2] text-[#444650]'
          }`}
        >
          A5
        </button>
        <Button
          label="Print Pass"
          variant="primary"
          onClick={() => window.print()}
        />
      </div>

      {/* Pass card */}
      <div
        className={`waybill-pass-card bg-white shadow-md w-full ${
          pageSize === 'a4' ? 'max-w-2xl size-a4' : 'max-w-sm size-a5'
        }`}
      >
        {/* Navy header */}
        <div className="bg-[#002366] px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#D4AF37] flex items-center justify-center shrink-0">
            <span className="text-[#00113a] text-[13px] font-black leading-none">T</span>
          </div>
          <div>
            <p className="text-white text-[15px] font-bold leading-none">TeMS</p>
            <p className="text-[#758dd5] text-[11px] leading-tight mt-0.5">
              National Trade Infrastructure
            </p>
          </div>
          <div className="flex-1" />
          <p className="text-[#D4AF37] text-[11px] font-bold tracking-wide uppercase">
            Electronic Waybill
          </p>
        </div>

        {/* QR area */}
        <div className="flex flex-col items-center py-8 px-6 gap-4">
          {waybill.qr_payload ? (
            <div className="bg-white p-4" style={{ lineHeight: 0 }}>
              <QRCode value={waybill.qr_payload} size={200} />
            </div>
          ) : (
            <div className="w-[200px] h-[200px] bg-[#f4f3f9] flex items-center justify-center">
              <span className="text-[12px] text-[#444650] text-center px-3">
                QR code pending
              </span>
            </div>
          )}

          {/* Trust token */}
          {isPaid ? (
            <div className="bg-[#096c4b] text-white text-[13px] font-bold tracking-wider uppercase px-5 py-2 rounded-[8px]">
              PAID IN FULL
            </div>
          ) : (
            <div className="bg-[rgba(241,196,15,0.15)] text-[#0F172A] text-[13px] font-bold tracking-wider uppercase px-5 py-2 rounded-[8px]">
              PAYMENT PENDING
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-6 pb-8 border-t border-[#c5c6d2] pt-4">
          <table className="w-full text-[13px]">
            <tbody>
              <tr className="border-b border-[#f4f3f9]">
                <td className="py-2 text-[#444650] font-bold uppercase tracking-wide text-[11px] w-36">
                  WB ID
                </td>
                <td className="py-2 font-mono text-[#1a1b20] font-semibold">
                  {waybill.waybill_id}
                </td>
              </tr>
              <tr className="border-b border-[#f4f3f9]">
                <td className="py-2 text-[#444650] font-bold uppercase tracking-wide text-[11px]">
                  Departure
                </td>
                <td className="py-2 text-[#1a1b20]">{waybill.departure_date}</td>
              </tr>
              <tr className="border-b border-[#f4f3f9]">
                <td className="py-2 text-[#444650] font-bold uppercase tracking-wide text-[11px]">
                  Route
                </td>
                <td className="py-2 text-[#1a1b20]">
                  {waybill.origin_state} → {waybill.destination_state}
                </td>
              </tr>
              <tr className="border-b border-[#f4f3f9]">
                <td className="py-2 text-[#444650] font-bold uppercase tracking-wide text-[11px]">
                  Commodity
                </td>
                <td className="py-2 font-mono text-[#1a1b20]">{waybill.commodity_code}</td>
              </tr>
              <tr>
                <td className="py-2 text-[#444650] font-bold uppercase tracking-wide text-[11px]">
                  Expires
                </td>
                <td className="py-2 text-[#1a1b20]">
                  {new Date(waybill.expires_at).toLocaleDateString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#00113a] px-6 py-3">
          <p className="text-[#758dd5] text-[10px] text-center">
            This waybill is an official government document. Tampering is a criminal offence.
          </p>
        </div>
      </div>
    </div>
  );
}
