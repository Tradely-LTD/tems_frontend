import { useDisputeWaybillMutation } from '../services/waybillSlice';

export function useWaybillDispute() {
  const [disputeMutation, { isLoading, error }] = useDisputeWaybillMutation();

  const dispute = (id: string, reason?: string) =>
    disputeMutation({ id, reason }).unwrap();

  return { dispute, isLoading, error };
}
