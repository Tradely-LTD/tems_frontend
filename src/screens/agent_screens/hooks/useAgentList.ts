import { useState } from 'react';
import { useGetAgentsQuery } from '../services/agentSlice';
import type { AgentListParams } from '../services/types';

type ActiveFilter = 'all' | 'active' | 'inactive';

interface UseAgentListResult {
  agents: ReturnType<typeof useGetAgentsQuery>['data'];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  page: number;
  setPage: (page: number) => void;
  activeFilter: ActiveFilter;
  setActiveFilter: (filter: ActiveFilter) => void;
}

export function useAgentList(): UseAgentListResult {
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');

  const params: AgentListParams = {
    page,
    limit: 20,
    ...(activeFilter === 'active' && { is_active: true }),
    ...(activeFilter === 'inactive' && { is_active: false }),
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useGetAgentsQuery(params);

  function handleSetActiveFilter(filter: ActiveFilter) {
    setActiveFilter(filter);
    setPage(1);
  }

  return {
    agents: data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    page,
    setPage,
    activeFilter,
    setActiveFilter: handleSetActiveFilter,
  };
}
