import { useGetMyAgentProfileQuery } from '../services/agentSlice';
import type { AgentProfile } from '../services/types';

interface UseAgentProfileResult {
  data: AgentProfile | null;
  isLoading: boolean;
  isError: boolean;
}

export function useAgentProfile(): UseAgentProfileResult {
  const { data, isLoading, isError, error } = useGetMyAgentProfileQuery();

  // 404 means no agent record yet — not a real error, just an unregistered user
  const is404 = isError && (error as any)?.status === 404;

  return {
    data: data?.data ?? null,
    isLoading,
    isError: isError && !is404,
  };
}
