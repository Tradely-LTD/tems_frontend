import { useState } from 'react';
import { useGetWaybillsQuery } from '../services/waybillSlice';

const PAGE_SIZE = 20;

export function useWaybillList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useGetWaybillsQuery({
    page,
    limit: PAGE_SIZE,
    shipment_status: statusFilter || undefined,
    search: search || undefined,
  });

  const waybills = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    waybills,
    total,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    setPage,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    isLoading,
    error,
  };
}
