import { Table } from '@/components/Table';
import { Pagination } from '@/components/Pagination';
import { StatusBadge } from '@/components/StatusBadge';
import type { ColumnDef } from '@/components/Table';
import { useKycReviewQueue } from './hooks/useKycReviewQueue';
import { kycStatusToBadge, DOC_TYPE_LABELS } from './utils/kycUtils';
import type { AdminKycSubmission } from './services/types';
import KycReviewModal from './KycReviewModal';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted (Pending Review)' },
  { value: 'verified',  label: 'Verified' },
  { value: 'rejected',  label: 'Rejected' },
  { value: 'all',       label: 'All Statuses' },
];

const COLUMNS: ColumnDef<AdminKycSubmission>[] = [
  {
    key: 'full_name',
    header: 'Full Name',
  },
  {
    key: 'email',
    header: 'Email',
  },
  {
    key: 'primary_document',
    header: 'Document Type',
    render: (row) =>
      DOC_TYPE_LABELS[row.primary_document?.id_type ?? ''] ?? '—',
  },
  {
    key: 'created_at',
    header: 'Submitted',
    render: (row) => new Date(row.created_at).toLocaleDateString(),
  },
  {
    key: 'kyc_status',
    header: 'Status',
    render: (row) => (
      <StatusBadge
        variant={kycStatusToBadge(row.kyc_status)}
        label={row.kyc_status.toUpperCase()}
      />
    ),
  },
];

export default function KycReviewQueue() {
  const {
    submissions,
    total,
    page,
    totalPages,
    statusFilter,
    isLoading,
    setPage,
    setStatusFilter,
    selectedSubmission,
    openReview,
    closeReview,
  } = useKycReviewQueue();

  return (
    <div>
      {/* Page header */}
      <h1 className="text-[24px] font-bold text-[#1a1b20] mb-1">Identity & KYC Review</h1>
      <p className="text-[14px] text-[#444650] mb-6">
        Review submitted identity profiles and approve or reject KYC applications.
      </p>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <label
          htmlFor="kyc-status-filter"
          className="text-[13px] font-semibold text-[#444650] uppercase tracking-wide whitespace-nowrap"
        >
          Status:
        </label>
        <select
          id="kyc-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#002366]/30"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[13px] text-[#444650]">
          {total} result{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c5c6d2] rounded overflow-hidden">
        <Table<AdminKycSubmission>
          columns={COLUMNS}
          data={submissions}
          onRowClick={openReview}
          loading={isLoading}
          emptyMessage="No KYC submissions found for the selected filter."
        />

        {total > PAGE_SIZE && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Review modal */}
      {selectedSubmission && (
        <KycReviewModal
          submission={selectedSubmission}
          onClose={closeReview}
        />
      )}
    </div>
  );
}
