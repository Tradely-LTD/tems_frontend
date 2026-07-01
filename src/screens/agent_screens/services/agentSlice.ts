/**
 * @module agent_screens
 * @depends store/emptyApi
 * @routes /api/agents
 */
import { emptyApi } from '../../../store/emptyApi';
import type {
  AgentListParams,
  AgentListResponse,
  AgentProfileResponse,
  RegisterAgentRequest,
  RegisterAgentResponse,
  PatchAgentRequest,
  InviteAgentRequest,
  InviteAgentResponse,
  MarketOption,
} from './types';

const agentApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgents: builder.query<AgentListResponse, AgentListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page !== undefined) searchParams.set('page', String(params.page));
        if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
        if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
        if (params?.market_id) searchParams.set('market_id', params.market_id);
        if (params?.org_id) searchParams.set('org_id', params.org_id);
        const qs = searchParams.toString();
        return `/agents${qs ? `?${qs}` : ''}`;
      },
      providesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    getMyAgentProfile: builder.query<AgentProfileResponse, void>({
      query: () => '/agents/me',
      providesTags: [{ type: 'Agent', id: 'ME' }],
    }),

    getAgentById: builder.query<AgentProfileResponse, string>({
      query: (id) => `/agents/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Agent', id }],
    }),

    registerAgent: builder.mutation<RegisterAgentResponse, RegisterAgentRequest>({
      query: (body) => ({ url: '/agents', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    updateAgent: builder.mutation<AgentProfileResponse, { id: string; body: PatchAgentRequest }>({
      query: ({ id, body }) => ({ url: `/agents/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Agent', id: 'LIST' },
        { type: 'Agent', id },
        { type: 'Agent', id: 'ME' },
      ],
    }),

    inviteAgent: builder.mutation<InviteAgentResponse, InviteAgentRequest>({
      query: (body) => ({ url: '/agents/invite', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    patchMyProfile: builder.mutation<AgentProfileResponse, PatchAgentRequest>({
      query: (body) => ({ url: '/agents/me', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Agent', id: 'ME' }],
    }),

    topupWallet: builder.mutation<{ success: boolean; data: { float_balance: string } }, { amount: number }>({
      query: (body) => ({ url: '/agents/me/topup', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'ME' }],
    }),

    getMarkets: builder.query<{ success: boolean; data: MarketOption[] }, void>({
      query: () => '/locations/markets',
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAgentsQuery,
  useGetMyAgentProfileQuery,
  useGetAgentByIdQuery,
  useRegisterAgentMutation,
  useUpdateAgentMutation,
  useInviteAgentMutation,
  usePatchMyProfileMutation,
  useTopupWalletMutation,
  useGetMarketsQuery,
} = agentApi;
