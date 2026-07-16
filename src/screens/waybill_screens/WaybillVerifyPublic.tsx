import { useParams, useSearchParams } from 'react-router-dom';
import { useGetPublicVerificationQuery } from './services/waybillSlice';

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  valid:     { bg: '#e6f4ef', fg: '#096c4b', label: 'Valid' },
  expired:   { bg: '#fef3c7', fg: '#92400e', label: 'Expired' },
  cancelled: { bg: '#fee2e2', fg: '#dc2626', label: 'Cancelled' },
  disputed:  { bg: '#fee2e2', fg: '#dc2626', label: 'Disputed' },
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function WaybillVerifyPublic() {
  const { waybillId } = useParams<{ waybillId: string }>();
  const [searchParams] = useSearchParams();

  // Embedded directly in the QR as query params — lets this page show
  // something useful even if the live verification call below fails
  // because the scanning device has no/poor connectivity.
  const embedded = {
    origin_state: searchParams.get('o'),
    destination_state: searchParams.get('d'),
    commodity_code: searchParams.get('c'),
    expires_at: searchParams.get('e'),
  };
  const hasEmbeddedFallback = !!(embedded.origin_state && embedded.destination_state);

  const { data, error, isLoading, isFetching, refetch } = useGetPublicVerificationQuery(waybillId ?? '');

  const notFound = !!error && 'status' in error && error.status === 404;
  const networkFailure = !!error && !notFound;
  const verified = data?.data;

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4">
      <div className="bg-white border border-[#c5c6d2] rounded-xl shadow-sm p-8 max-w-md w-full">

        {/* Brand header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded bg-[#D4AF37] flex items-center justify-center shrink-0">
            <span className="text-[#00113a] text-[13px] font-black leading-none">T</span>
          </div>
          <div>
            <p className="text-[#1a1b20] text-[14px] font-bold leading-none">TeMS</p>
            <p className="text-[#94a3b8] text-[11px] mt-0.5">Waybill Verification</p>
          </div>
        </div>

        {isLoading && !hasEmbeddedFallback && (
          <div className="py-10 text-center text-[13px] text-[#94a3b8]">Verifying…</div>
        )}

        {/* Not a real waybill — the actual "is this genuine" failure case */}
        {notFound && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-[#fee2e2] flex items-center justify-center mx-auto mb-4">
              <span className="text-[#dc2626] text-[24px]">✕</span>
            </div>
            <h1 className="text-[18px] font-bold text-[#dc2626] mb-1">Not a valid TeMS waybill</h1>
            <p className="text-[13px] text-[#64748b]">
              This QR code does not match any waybill on record. Do not accept it as genuine.
            </p>
          </div>
        )}

        {/* Confirmed live against the server */}
        {verified && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-[#e6f4ef] flex items-center justify-center shrink-0">
                <span className="text-[#096c4b] text-[16px]">✓</span>
              </span>
              <div>
                <p className="text-[14px] font-bold text-[#096c4b] leading-tight">Genuine — verified live</p>
                <p className="text-[11px] text-[#94a3b8]">Confirmed against TeMS records just now</p>
              </div>
            </div>
            <VerifyDetails
              waybillId={verified.waybill_id}
              status={verified.status}
              origin={verified.origin_state}
              destination={verified.destination_state}
              commodity={verified.commodity_code}
              generatedAt={verified.generated_at}
              expiresAt={verified.expires_at}
            />
          </div>
        )}

        {/* Live check failed (offline / server unreachable) — fall back to what's printed on the QR itself */}
        {networkFailure && (
          <div>
            {hasEmbeddedFallback ? (
              <>
                <div className="flex items-center gap-2 mb-4 bg-[#fef3c7] rounded-lg px-3 py-2.5">
                  <span className="text-[#92400e] text-[14px]">⚠</span>
                  <p className="text-[12px] text-[#92400e] leading-snug">
                    Couldn't reach TeMS to confirm this is genuine right now. Showing the details printed on
                    this waybill — connect to the internet and rescan to fully verify.
                  </p>
                </div>
                <VerifyDetails
                  waybillId={waybillId ?? '—'}
                  status={null}
                  origin={embedded.origin_state ?? '—'}
                  destination={embedded.destination_state ?? '—'}
                  commodity={embedded.commodity_code ?? '—'}
                  generatedAt={undefined}
                  expiresAt={embedded.expires_at ?? undefined}
                />
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-[13px] text-[#64748b] mb-4">
                  Couldn't reach TeMS to verify this waybill. Check your connection and try again.
                </p>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="text-[13px] font-semibold text-white bg-[#002366] px-4 py-2 rounded-lg hover:bg-[#001a4d] disabled:opacity-60"
                >
                  {isFetching ? 'Retrying…' : 'Retry'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Still loading but we have something to show immediately from the QR itself */}
        {isLoading && hasEmbeddedFallback && (
          <div>
            <div className="flex items-center gap-2 mb-4 bg-[#f1f3f9] rounded-lg px-3 py-2.5">
              <span className="text-[12px] text-[#64748b]">Confirming with TeMS…</span>
            </div>
            <VerifyDetails
              waybillId={waybillId ?? '—'}
              status={null}
              origin={embedded.origin_state ?? '—'}
              destination={embedded.destination_state ?? '—'}
              commodity={embedded.commodity_code ?? '—'}
              generatedAt={undefined}
              expiresAt={embedded.expires_at ?? undefined}
            />
          </div>
        )}

        <p className="text-[10px] text-[#94a3b8] text-center mt-6">
          This waybill ID: <span className="font-mono">{waybillId}</span>
        </p>
      </div>
    </div>
  );
}

function VerifyDetails({
  waybillId, status, origin, destination, commodity, generatedAt, expiresAt,
}: {
  waybillId: string;
  status: string | null;
  origin: string;
  destination: string;
  commodity: string;
  generatedAt?: string;
  expiresAt?: string;
}) {
  const statusStyle = status ? STATUS_STYLES[status] : null;
  return (
    <dl className="space-y-2.5 text-[13px]">
      <div className="flex justify-between gap-3">
        <dt className="text-[#64748b] font-medium">Waybill ID</dt>
        <dd className="font-mono font-semibold text-[#1a1b20]">{waybillId}</dd>
      </div>
      {statusStyle && (
        <div className="flex justify-between gap-3 items-center">
          <dt className="text-[#64748b] font-medium">Status</dt>
          <dd>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.fg }}
            >
              {statusStyle.label}
            </span>
          </dd>
        </div>
      )}
      <div className="flex justify-between gap-3">
        <dt className="text-[#64748b] font-medium">Route</dt>
        <dd className="text-[#1a1b20] text-right">{origin} → {destination}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-[#64748b] font-medium">Commodity</dt>
        <dd className="text-[#1a1b20] font-mono">{commodity}</dd>
      </div>
      {generatedAt && (
        <div className="flex justify-between gap-3">
          <dt className="text-[#64748b] font-medium">Issued</dt>
          <dd className="text-[#1a1b20]">{formatDate(generatedAt)}</dd>
        </div>
      )}
      {expiresAt && (
        <div className="flex justify-between gap-3">
          <dt className="text-[#64748b] font-medium">Expires</dt>
          <dd className="text-[#1a1b20]">{formatDate(expiresAt)}</dd>
        </div>
      )}
    </dl>
  );
}
