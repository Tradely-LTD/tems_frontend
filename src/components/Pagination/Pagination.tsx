import { clsx } from 'clsx';
import type { PaginationProps } from './types';

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#c5c6d2]">
      <span className="text-[14px] text-[#444650]">
        Showing {from}–{to} of {totalItems} records
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={clsx(
            'h-8 px-3 text-[13px] font-medium rounded border border-[#c5c6d2] transition-colors',
            page <= 1
              ? 'text-[#c5c6d2] cursor-not-allowed'
              : 'text-[#002366] hover:bg-[#002366]/5 cursor-pointer'
          )}
        >
          Previous
        </button>
        <span className="text-[13px] font-medium text-[#002366] px-2">
          {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={clsx(
            'h-8 px-3 text-[13px] font-medium rounded border border-[#c5c6d2] transition-colors',
            page >= totalPages
              ? 'text-[#c5c6d2] cursor-not-allowed'
              : 'text-[#002366] hover:bg-[#002366]/5 cursor-pointer'
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
