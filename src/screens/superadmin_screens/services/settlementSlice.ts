/**
 * @module superadmin_screens
 * @depends store/emptyApi
 * @routes /api/settlements
 */
import { emptyApi } from '@/store/emptyApi';
import type {
  SettlementListResponse,
  SettlementDetailResponse,
  RunSettlementInput,
  RunSettlementResponse,
} from './types';

const settlementApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    listSettlements: builder.query<SettlementListResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/settlements',
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: [{ type: 'Settlement', id: 'LIST' }],
    }),
    getSettlement: builder.query<SettlementDetailResponse, string>({
      query: (id) => `/settlements/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Settlement', id }],
    }),
    runSettlement: builder.mutation<RunSettlementResponse, RunSettlementInput>({
      query: (body) => ({ url: '/settlements/run', method: 'POST', body }),
      invalidatesTags: [{ type: 'Settlement', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useListSettlementsQuery, useGetSettlementQuery, useRunSettlementMutation } = settlementApi;
