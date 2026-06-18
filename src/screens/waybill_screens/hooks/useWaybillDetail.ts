import { useGetWaybillQuery } from '../services/waybillSlice';

export function useWaybillDetail(waybillId: string) {
  const { data, isLoading, error } = useGetWaybillQuery(waybillId, {
    skip: !waybillId,
  });

  const waybill = data?.data;

  const isExpired = waybill?.expires_at
    ? new Date(waybill.expires_at) < new Date()
    : false;

  return { waybill, isLoading, error, isExpired };
}
