import { useState } from 'react';
import { Table } from '@/components/Table';
import { Pagination } from '@/components/Pagination';
import { StatusBadge, shipmentStatusToBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Buttons';
import { useWaybillList } from './hooks/useWaybillList';
import { useWaybillCancel } from './hooks/useWaybillCancel';
import { useWaybillDispute } from './hooks/useWaybillDispute';
import type { Waybill } from './services/types';
import type { ColumnDef } from '@/components/Table';

const CANCEL_ALLOWED = ['draft', 'active'];
const DISPUTE_ALLOWED = ['active', 'in_transit', 'delivered'];

function formatNGN(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₦0.00';
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

export default function WaybillManage() {
  const {
    waybills,
    total,
    page,
    totalPages,
    pageSize,
    setPage,
    isLoading,
  } = useWaybillList();

  const { cancel, isLoading: cancelling } = useWaybillCancel();
  const { dispute, isLoading: disputing } = useWaybillDispute();

  const [cancelTarget, setCancelTarget] = useState<Waybill | null>(null);
  const [disputeTarget, setDisputeTarget] = useState<Waybill | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCancel() {
    if (!cancelTarget) return;
    setActionError(null);
    try {
      await cancel(cancelTarget.waybill_id, cancelReason || undefined);
      setCancelTarget(null);
      setCancelReason('');
    } catch {
      setActionError('Failed to cancel waybill. Please try again.');
    }
  }

  async function handleDispute() {
    if (!disputeTarget) return;
    setActionError(null);
    try {
      await dispute(disputeTarget.waybill_id, disputeReason || undefined);
      setDisputeTarget(null);
      setDisputeReason('');
    } catch {
      setActionError('Failed to raise dispute. Please try again.');
    }
  }

  const columns: ColumnDef<Waybill>[] = [
    {
      key: 'waybill_id',
      header: 'Waybill ID',
      mono: true,
      render: (row) => (
        <span className="font-mono text-[13px]">{row.waybill_id}</span>
      ),
    },
    {
      key: 'shipper_tems_id',
      header: 'Shipper ID',
      render: (row) => <span className="font-mono text-[13px]">{row.shipper_tems_id ?? '—'}</span>,
    },
    {
      key: 'destination_state',
      header: 'Destination',
      render: (row) => (
        <span>
          {row.destination_state}
          {row.destination_lga ? `, ${row.destination_lga}` : ''}
        </span>
      ),
    },
    {
      key: 'levy_total',
      header: 'Levy Total',
      render: (row) => (
        <span className="font-mono">{formatNGN(row.levy_total)}</span>
      ),
    },
    {
      key: 'shipment_status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          variant={shipmentStatusToBadge(row.shipment_status)}
          label={row.shipment_status.replace(/_/g, ' ').toUpperCase()}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const canCancel = CANCEL_ALLOWED.includes(row.shipment_status);
        const canDispute = DISPUTE_ALLOWED.includes(row.shipment_status);
        return (
          <div className="flex items-center gap-2">
            <button
              disabled={!canCancel}
              onClick={(e) => {
                e.stopPropagation();
                setCancelTarget(row);
                setActionError(null);
              }}
              className={`h-7 px-2.5 text-[12px] font-semibold rounded transition-colors ${
                canCancel
                  ? 'bg-[#D83B01] text-white hover:opacity-90 cursor-pointer'
                  : 'bg-[#c5c6d2] text-[#444650] cursor-not-allowed'
              }`}
            >
              Cancel
            </button>
            <button
              disabled={!canDispute}
              onClick={(e) => {
                e.stopPropagation();
                setDisputeTarget(row);
                setActionError(null);
              }}
              className={`h-7 px-2.5 text-[12px] font-semibold rounded border transition-colors ${
                canDispute
                  ? 'border-[#002366] text-[#002366] hover:bg-[#002366]/5 cursor-pointer'
                  : 'border-[#c5c6d2] text-[#444650] cursor-not-allowed'
              }`}
            >
              Dispute
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1a1b20]">Waybill Management</h1>
        <p className="text-[14px] text-[#444650] mt-0.5">
          Cancel or dispute waybills
        </p>
      </div>

      <div className="bg-white border border-[#c5c6d2] rounded">
        <Table<Waybill>
          columns={columns}
          data={waybills}
          loading={isLoading}
          emptyMessage="No waybills found."
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {/* Cancel Modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => {
          setCancelTarget(null);
          setCancelReason('');
          setActionError(null);
        }}
        title="Cancel Waybill"
        confirmLabel="Cancel Waybill"
        confirmVariant="danger"
        confirmLoading={cancelling}
        onConfirm={handleCancel}
        cancelLabel="Keep Waybill"
      >
        <div className="flex flex-col gap-3">
          <p className="text-[14px] text-[#1a1b20]">
            Are you sure you want to cancel waybill{' '}
            <span className="font-mono font-semibold">
              {cancelTarget?.waybill_id}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="cancel-reason"
              className="text-[14px] font-medium text-[#1a1b20]"
            >
              Reason (optional)
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full rounded border border-[#c5c6d2] bg-white px-3 py-2 text-[14px] text-[#1a1b20] focus:outline-none focus:ring-2 focus:ring-[#435b9f] resize-none"
            />
          </div>
          {actionError && (
            <p className="text-[13px] text-[#D83B01]">{actionError}</p>
          )}
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        open={!!disputeTarget}
        onClose={() => {
          setDisputeTarget(null);
          setDisputeReason('');
          setActionError(null);
        }}
        title="Raise Dispute"
        confirmLabel="Raise Dispute"
        confirmVariant="primary"
        confirmLoading={disputing}
        onConfirm={handleDispute}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[14px] text-[#1a1b20]">
            Raise a dispute for waybill{' '}
            <span className="font-mono font-semibold">
              {disputeTarget?.waybill_id}
            </span>
            .
          </p>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="dispute-reason"
              className="text-[14px] font-medium text-[#1a1b20]"
            >
              Reason (optional)
            </label>
            <textarea
              id="dispute-reason"
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe the dispute..."
              className="w-full rounded border border-[#c5c6d2] bg-white px-3 py-2 text-[14px] text-[#1a1b20] focus:outline-none focus:ring-2 focus:ring-[#435b9f] resize-none"
            />
          </div>
          {actionError && (
            <p className="text-[13px] text-[#D83B01]">{actionError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
