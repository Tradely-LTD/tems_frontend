import { useNavigate } from 'react-router-dom';
import { Table } from '@/components/Table';
import { Pagination } from '@/components/Pagination';
import { Select } from '@/components/Select';
import { StatusBadge, shipmentStatusToBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Buttons';
import { Input } from '@/components/Inputs';
import { useWaybillList } from './hooks/useWaybillList';
import { buildWaybillDetailRoute, ROUTES } from '@/constants/routes';
import type { Waybill } from './services/types';
import type { ColumnDef } from '@/components/Table';

function formatNGN(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₦0.00';
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

const SHIPMENT_STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Expired', value: 'expired' },
  { label: 'Disputed', value: 'disputed' },
];

export default function WaybillLedger() {
  const navigate = useNavigate();
  const {
    waybills,
    total,
    page,
    totalPages,
    pageSize,
    setPage,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    isLoading,
  } = useWaybillList();

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
      key: 'commodity_code',
      header: 'Commodity',
      render: (row) => (
        <span className="font-mono text-[13px]">{row.commodity_code}</span>
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
      header: 'Shipment Status',
      render: (row) => (
        <StatusBadge
          variant={shipmentStatusToBadge(row.shipment_status)}
          label={row.shipment_status.replace(/_/g, ' ').toUpperCase()}
        />
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (row) => (
        <StatusBadge
          variant={row.payment_status === 'success' ? 'valid' : 'pending'}
          label={row.payment_status.toUpperCase()}
        />
      ),
    },
    {
      key: 'departure_date',
      header: 'Departure',
      render: (row) => (
        <span>{row.departure_date}</span>
      ),
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1b20]">Waybill Ledger</h1>
          <p className="text-[14px] text-[#444650] mt-0.5">
            Track and manage all issued waybills
          </p>
        </div>
        <Button
          label="Issue Waybill"
          variant="primary"
          onClick={() => navigate(ROUTES.WAYBILLS_NEW)}
        />
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4 mb-4">
        <div className="flex-1 max-w-sm">
          <Input
            id="waybill-search"
            label="Search"
            placeholder="Search by waybill ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-52">
          <Select
            id="status-filter"
            label="Shipment Status"
            options={SHIPMENT_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c5c6d2] rounded">
        <Table<Waybill>
          columns={columns}
          data={waybills}
          loading={isLoading}
          onRowClick={(row) => navigate(buildWaybillDetailRoute(row.waybill_id))}
          emptyMessage="No waybills found. Issue your first waybill to get started."
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
