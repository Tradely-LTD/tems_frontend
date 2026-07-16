import React from 'react';
import QRCode from 'react-qr-code';
import type { Waybill } from './services/types';

// ─── Print config ─────────────────────────────────────────────────────────────

export interface PrintConfig {
  label: string;
  widthMm: number;
  heightMm: number;
  marginMm: number;
}

export const PRINT_PRESETS: PrintConfig[] = [
  { label: '58mm', widthMm: 58,  heightMm: 240, marginMm: 2 },
  { label: '72mm', widthMm: 72,  heightMm: 240, marginMm: 2 },
  { label: '80mm', widthMm: 80,  heightMm: 240, marginMm: 3 },
  { label: 'A5',   widthMm: 148, heightMm: 210, marginMm: 10 },
  { label: 'A4',   widthMm: 210, heightMm: 297, marginMm: 15 },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  waybill: Waybill;
  config: PrintConfig;
}

const NAVY  = '#002366';
const DARK  = '#00113a';
const GOLD  = '#D4AF37';
const SLATE = '#758dd5';
const GREEN = '#096c4b';
const AMBER = '#92400e';
const GREY  = '#444650';

const WaybillReceipt = React.forwardRef<HTMLDivElement, Props>(({ waybill, config }, ref) => {
  const { widthMm, marginMm } = config;
  const narrow  = widthMm < 100;
  const isPaid  = waybill.payment_status === 'success';
  const printedAt = new Date().toLocaleString();
  const products  = waybill.products ?? [];

  // Base font scaled to paper width
  const base = narrow ? 7 : 9;

  // ── Shared inline style helpers ──────────────────────────────────────────────

  const wrap: React.CSSProperties = {
    width: `${widthMm}mm`,
    margin: '0 auto',
    backgroundColor: '#fff',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: `${base}px`,
    color: '#000',
    border: '1px solid #000',
    boxSizing: 'border-box',
  };

  const sectionHead = (bg = NAVY): React.CSSProperties => ({
    backgroundColor: bg,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: `${base - 1}px`,
    letterSpacing: '0.6px',
    padding: narrow ? '2px 5px' : '3px 7px',
    textTransform: 'uppercase',
  });

  const row: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    padding: narrow ? '2px 5px' : '3px 7px',
    borderBottom: '1px solid #ebebeb',
    gap: '4px',
  };

  const lbl: React.CSSProperties = {
    width: narrow ? '38%' : '35%',
    flexShrink: 0,
    color: GREY,
    fontWeight: 'bold',
    fontSize: `${base - 1}px`,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  };

  const val: React.CSSProperties = {
    flex: 1,
    fontSize: `${base}px`,
    minWidth: 0,
    wordBreak: 'break-word',
  };

  const mono: React.CSSProperties = { ...val, fontFamily: 'Courier New, monospace', fontWeight: 'bold' };

  const divider: React.CSSProperties = { borderTop: '2px solid #000', margin: 0 };

  const th = (align: 'left' | 'right' | 'center' = 'left'): React.CSSProperties => ({
    padding: narrow ? '2px 3px' : '3px 5px',
    textAlign: align,
    fontWeight: 'bold',
    fontSize: `${base - 1}px`,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    borderRight: '1px solid #ccc',
    borderBottom: '1px solid #000',
    backgroundColor: '#f0f0f0',
    whiteSpace: 'nowrap',
  });

  const td = (align: 'left' | 'right' | 'center' = 'left'): React.CSSProperties => ({
    padding: narrow ? '2px 3px' : '3px 5px',
    textAlign: align,
    verticalAlign: 'top',
    borderRight: '1px solid #eee',
    fontSize: `${base}px`,
  });

  const sigLine: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    marginBottom: narrow ? '5px' : '9px',
  };

  const sigUnderline: React.CSSProperties = {
    flex: 1,
    borderBottom: '1px solid #888',
  };

  const twoCol: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: narrow ? '1fr' : '1fr 1fr',
  };

  return (
    <div ref={ref} style={wrap}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: NAVY,
        padding: narrow ? '6px 6px 5px' : '10px 10px 7px',
        display: 'flex',
        alignItems: narrow ? 'flex-start' : 'center',
        flexDirection: narrow ? 'column' : 'row',
        gap: narrow ? '5px' : '10px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: narrow ? '20px' : '26px',
              height: narrow ? '20px' : '26px',
              backgroundColor: GOLD,
              borderRadius: '3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900,
              fontSize: narrow ? '11px' : '15px',
              color: DARK, flexShrink: 0,
            }}>T</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: narrow ? '13px' : '17px', lineHeight: 1.1 }}>
                TeMS
              </div>
              <div style={{ color: SLATE, fontSize: `${base - 1}px`, marginTop: '1px' }}>
                National Trade Infrastructure
              </div>
            </div>
          </div>
          <div style={{
            color: GOLD, fontWeight: 'bold',
            fontSize: `${base}px`, letterSpacing: '1px',
            marginTop: narrow ? '4px' : '7px',
            textTransform: 'uppercase',
          }}>
            ELECTRONIC WAYBILL
          </div>
        </div>

        {/* QR code in header */}
        {waybill.qr_payload ? (
          <div style={{ backgroundColor: '#fff', padding: '4px', borderRadius: '3px', flexShrink: 0 }}>
            <QRCode value={waybill.qr_payload} size={narrow ? 52 : 72} />
          </div>
        ) : null}
      </div>

      {/* ── WAYBILL ID + STATUS BAR ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: narrow ? '3px 5px' : '4px 8px',
        borderBottom: '2px solid #000',
        gap: '6px',
        flexWrap: 'wrap',
        backgroundColor: '#f8f8ff',
      }}>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'baseline' }}>
          <span style={{ ...lbl, width: 'auto' }}>WB No:</span>
          <span style={{ ...mono, fontSize: narrow ? '8px' : '11px' }}>{waybill.waybill_id}</span>
        </div>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'baseline', marginLeft: narrow ? 0 : '12px' }}>
          <span style={{ ...lbl, width: 'auto' }}>Date:</span>
          <span style={{ ...val, fontSize: `${base}px` }}>{new Date(waybill.generated_at).toLocaleDateString('en-GB')}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          backgroundColor: isPaid ? GREEN : AMBER,
          color: '#fff',
          padding: narrow ? '1px 5px' : '2px 8px',
          borderRadius: '3px',
          fontWeight: 'bold',
          fontSize: `${base}px`,
          letterSpacing: '0.5px',
        }}>
          {isPaid ? 'PAID IN FULL' : 'PAYMENT PENDING'}
        </div>
      </div>

      {/* ── SHIPPER / CONSIGNEE ─────────────────────────────────────────────── */}
      <div style={{ ...twoCol, borderBottom: '1px solid #000' }}>
        <div style={{ borderRight: narrow ? 'none' : '1px solid #ccc', borderBottom: narrow ? '1px solid #ccc' : 'none' }}>
          <div style={sectionHead()}>Shipper</div>
          {waybill.shipper_tems_id && (
            <div style={row}><span style={lbl}>TeMS ID</span><span style={mono}>{waybill.shipper_tems_id}</span></div>
          )}
          {waybill.shipper_tin && (
            <div style={row}><span style={lbl}>TIN</span><span style={mono}>{waybill.shipper_tin}</span></div>
          )}
          {!waybill.shipper_tems_id && !waybill.shipper_tin && (
            <div style={{ ...row, color: '#aaa', fontStyle: 'italic' }}>—</div>
          )}
        </div>
        <div>
          <div style={sectionHead()}>Consignee</div>
          {waybill.consignee_name && (
            <div style={row}><span style={lbl}>Name</span><span style={val}>{waybill.consignee_name}</span></div>
          )}
          {waybill.consignee_phone && (
            <div style={row}><span style={lbl}>Phone</span><span style={mono}>{waybill.consignee_phone}</span></div>
          )}
          {waybill.consignee_tin && (
            <div style={row}><span style={lbl}>TIN</span><span style={mono}>{waybill.consignee_tin}</span></div>
          )}
        </div>
      </div>

      {/* ── ROUTE & TRANSPORT ───────────────────────────────────────────────── */}
      <div style={{ ...twoCol, borderBottom: '1px solid #000' }}>
        <div style={{ borderRight: narrow ? 'none' : '1px solid #ccc', borderBottom: narrow ? '1px solid #ccc' : 'none' }}>
          <div style={sectionHead()}>Route</div>
          <div style={row}>
            <span style={lbl}>From</span>
            <span style={val}>
              {[waybill.origin_state, waybill.origin_lga, waybill.origin_market].filter(Boolean).join(', ')}
            </span>
          </div>
          <div style={row}>
            <span style={lbl}>To</span>
            <span style={val}>
              {[waybill.destination_state, waybill.destination_lga, waybill.destination_market].filter(Boolean).join(', ')}
            </span>
          </div>
          <div style={row}>
            <span style={lbl}>Departure</span>
            <span style={val}>
              {waybill.departure_date}
              {waybill.departure_time ? ` · ${waybill.departure_time}` : ''}
            </span>
          </div>
          {waybill.estimated_arrival && (
            <div style={row}>
              <span style={lbl}>Est. Arrival</span>
              <span style={val}>{waybill.estimated_arrival}</span>
            </div>
          )}
        </div>
        <div>
          <div style={sectionHead()}>Transport</div>
          <div style={row}><span style={lbl}>Driver</span><span style={val}>{waybill.driver_name || '—'}</span></div>
          {waybill.driver_phone && (
            <div style={row}><span style={lbl}>Drv Phone</span><span style={mono}>{waybill.driver_phone}</span></div>
          )}
          <div style={row}><span style={lbl}>Vehicle</span><span style={mono}>{waybill.vehicle_reg}</span></div>
          <div style={row}><span style={lbl}>Channel</span><span style={val}>{waybill.channel || '—'}</span></div>
        </div>
      </div>

      {/* ── COMMODITIES & PRODUCTS ──────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #000' }}>
        <div style={sectionHead()}>Commodity</div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={th()}>No.</th>
                <th style={th()}>Code</th>
                {!narrow && <th style={{ ...th(), width: '30%' }}>Description</th>}
                <th style={th('right')}>Qty</th>
                <th style={th()}>Unit</th>
                <th style={th('right')}>Wt (kg)</th>
                {!narrow && <th style={{ ...th('right'), borderRight: 'none' }}>Value (₦)</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ backgroundColor: i % 2 ? '#fafafa' : '#fff' }}>
                  <td style={td('center')}>{i + 1}</td>
                  <td style={{ ...td(), fontFamily: 'Courier New, monospace' }}>{p.commodity_code}</td>
                  {!narrow && <td style={td()}>{p.description}</td>}
                  <td style={td('right')}>{p.quantity}</td>
                  <td style={td()}>{p.unit}</td>
                  <td style={td('right')}>{Number(p.weight_kg).toLocaleString()}</td>
                  {!narrow && (
                    <td style={{ ...td('right'), borderRight: 'none' }}>
                      {Number(p.declared_total_value).toLocaleString()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div style={row}>
            <span style={lbl}>Commodity Code</span>
            <span style={mono}>{waybill.commodity_code}</span>
          </div>
        )}

        {/* Totals bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: narrow ? '2px 5px' : '3px 7px',
          backgroundColor: '#f0f0f0',
          borderTop: '1px solid #ccc',
          fontWeight: 'bold',
          fontSize: `${base}px`,
        }}>
          <span>TOTAL DECLARED VALUE</span>
          <span>₦{Number(waybill.total_declared_value).toLocaleString()}</span>
        </div>
      </div>

      {/* ── LEVY ────────────────────────────────────────────────────────────── */}
      {(waybill.levy_breakdown?.length > 0 || Number(waybill.levy_total) > 0) && (
        <div style={{ borderBottom: '1px solid #000' }}>
          <div style={sectionHead()}>Levy Breakdown</div>
          {waybill.levy_breakdown?.map((line) => (
            <div key={line.authority_name} style={{ ...row, justifyContent: 'space-between' }}>
              <span style={lbl}>{line.authority_name}</span>
              <span style={val}>₦{Number(line.amount).toLocaleString()}</span>
            </div>
          ))}
          {Number(waybill.data_fee) > 0 && (
            <div style={{ ...row, justifyContent: 'space-between' }}>
              <span style={lbl}>Data Fee</span>
              <span style={val}>₦{Number(waybill.data_fee).toLocaleString()}</span>
            </div>
          )}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: narrow ? '3px 5px' : '4px 7px',
            backgroundColor: NAVY, color: '#fff',
            fontWeight: 'bold',
            fontSize: `${base}px`,
          }}>
            <span>LEVY TOTAL</span>
            <span>₦{Number(waybill.levy_total).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ── VALIDITY ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #000' }}>
        <div style={{ ...row, borderRight: '1px solid #ccc', borderBottom: 'none' }}>
          <span style={lbl}>Generated</span>
          <span style={val}>{new Date(waybill.generated_at).toLocaleDateString('en-GB')}</span>
        </div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <span style={lbl}>Expires</span>
          <span style={{ ...val, color: '#b45309', fontWeight: 'bold' }}>
            {new Date(waybill.expires_at).toLocaleDateString('en-GB')}
          </span>
        </div>
      </div>

      {narrow && waybill.blockchain_hash && (
        <div style={{ ...row, borderBottom: '1px solid #000' }}>
          <span style={lbl}>Hash</span>
          <span style={{ ...mono, fontSize: '5px', color: '#666', wordBreak: 'break-all' }}>
            {waybill.blockchain_hash}
          </span>
        </div>
      )}

      {/* ── RECEIVER CONFIRMATION ───────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #000' }}>
        <div style={sectionHead('#444')}>Receiver Confirmation</div>
        <div style={{
          ...twoCol,
          padding: narrow ? '5px' : '8px',
          gap: narrow ? '5px' : '12px',
        }}>
          <div>
            <div style={sigLine}>
              <span style={{ ...lbl, width: '45%' }}>Receiver's Name</span>
              <span style={sigUnderline} />
            </div>
            <div style={sigLine}>
              <span style={{ ...lbl, width: '45%' }}>Phone No.</span>
              <span style={sigUnderline} />
            </div>
            <div style={sigLine}>
              <span style={{ ...lbl, width: '45%' }}>Date</span>
              <span style={sigUnderline} />
              <span style={{ ...lbl, width: '25%' }}>Time</span>
              <span style={sigUnderline} />
            </div>
          </div>
          <div>
            <div style={sigLine}>
              <span style={{ ...lbl, width: '45%' }}>Qty Received</span>
              <span style={sigUnderline} />
            </div>
            <div style={{ ...sigLine, marginTop: narrow ? '8px' : '16px' }}>
              <span style={{ ...lbl, width: '45%' }}>Signature</span>
              <span style={{ ...sigUnderline, height: narrow ? '18px' : '28px' }} />
            </div>
            <div style={sigLine}>
              <span style={{ ...lbl, width: '45%' }}>Remarks</span>
              <span style={sigUnderline} />
            </div>
          </div>
        </div>
      </div>

      {/* ── APPROVAL ROW ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(4, 1fr)',
        borderBottom: '1px solid #000',
      }}>
        {["Officer's Name & Sig", "Driver's Name & Sig", 'Prepared By', 'Approved By'].map((label, i) => (
          <div key={label} style={{
            padding: narrow ? '5px 4px' : '8px 6px',
            borderRight: i < 3 ? '1px solid #ccc' : 'none',
          }}>
            <div style={{ height: narrow ? '20px' : '30px' }} />
            <div style={{
              borderTop: '1px solid #000',
              paddingTop: '2px',
              color: GREY,
              fontWeight: 'bold',
              fontSize: `${base - 1}px`,
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: DARK,
        padding: narrow ? '5px 6px' : '7px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '3px',
      }}>
        <span style={{ color: SLATE, fontSize: `${base - 1}px` }}>
          This waybill is an official government document. Tampering is a criminal offence.
        </span>
        <span style={{ color: SLATE, fontSize: `${base - 1}px` }}>
          Printed: {printedAt}
        </span>
      </div>

    </div>
  );
});

WaybillReceipt.displayName = 'WaybillReceipt';
export default WaybillReceipt;
