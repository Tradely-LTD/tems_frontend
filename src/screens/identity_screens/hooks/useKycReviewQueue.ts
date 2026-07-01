import { useState } from 'react';
import { useGetAdminSubmissionsQuery } from '../services/identitySlice';
import type { AdminKycSubmission } from '../services/types';

const PAGE_SIZE = 20;

export function useKycReviewQueue() {
  const [page, setPageRaw] = useState(1);
  const [statusFilter, setStatusFilterRaw] = useState<string>('submitted');
  const [selectedSubmission, setSelectedSubmission] = useState<AdminKycSubmission | null>(null);

  const { data, isLoading } = useGetAdminSubmissionsQuery({
    page,
    limit: PAGE_SIZE,
    kyc_status: statusFilter,
  });

  const submissions = data?.data.submissions ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  function setPage(p: number) {
    setPageRaw(p);
  }

  function setStatusFilter(s: string) {
    setStatusFilterRaw(s);
    setPageRaw(1);
  }

  function openReview(submission: AdminKycSubmission) {
    setSelectedSubmission(submission);
  }

  function closeReview() {
    setSelectedSubmission(null);
  }

  return {
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
  };
}
