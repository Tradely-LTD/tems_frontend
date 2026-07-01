import { useGetWaybillLevyLinesQuery } from '@/screens/superadmin_screens/services/revenueRulesSlice';

/**
 * Fetches the new per-authority revenue disbursement breakdown for a waybill
 * (waybill_levy_lines), distinct from the older `levy_breakdown` field already
 * present on the Waybill resource itself. Skips the call entirely when no
 * waybillId is available (e.g. while the parent waybill query is still loading).
 */
export function useWaybillLevyLines(waybillId: string) {
  const { data, isLoading, isError } = useGetWaybillLevyLinesQuery(waybillId, {
    skip: !waybillId,
  });

  return {
    levyLines: data?.data ?? [],
    levyLinesLoading: isLoading,
    levyLinesError: isError,
  };
}
