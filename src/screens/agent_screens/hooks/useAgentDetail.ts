import { useState } from 'react';
import { useGetAgentByIdQuery, useUpdateAgentMutation } from '../services/agentSlice';
import type { AgentProfile } from '../services/types';

interface UseAgentDetailResult {
  data: AgentProfile | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  handleToggleStatus: () => Promise<void>;
  isToggling: boolean;
  toggleError: string | null;
}

export function useAgentDetail(id: string): UseAgentDetailResult {
  const [toggleError, setToggleError] = useState<string | null>(null);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAgentByIdQuery(id, {
    skip: !id,
  });
  const [updateAgent, { isLoading: isToggling }] = useUpdateAgentMutation();

  const handleToggleStatus = async () => {
    const agent = data?.data;
    if (!agent) return;
    setToggleError(null);
    try {
      await updateAgent({ id, body: { is_active: !agent.is_active } }).unwrap();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setToggleError(e?.data?.message ?? 'Failed to update agent status. Please try again.');
    }
  };

  return {
    data: data?.data ?? null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    handleToggleStatus,
    isToggling,
    toggleError,
  };
}
