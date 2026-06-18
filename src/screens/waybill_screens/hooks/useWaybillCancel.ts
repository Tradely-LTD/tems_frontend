import { useCancelWaybillMutation } from '../services/waybillSlice';

export function useWaybillCancel() {
  const [cancelMutation, { isLoading, error }] = useCancelWaybillMutation();

  const cancel = (id: string, reason?: string) =>
    cancelMutation({ id, reason }).unwrap();

  return { cancel, isLoading, error };
}
