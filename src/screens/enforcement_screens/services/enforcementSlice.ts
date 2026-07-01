/**
 * @module enforcement_screens
 * @depends store/emptyApi
 * @routes /api/enforcement
 */
import { emptyApi } from '@/store/emptyApi';
import type { ScanListResponse, ScanDetailResponse, EnforcementScanInput } from './types';

const enforcementApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    listScans: builder.query<ScanListResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/enforcement',
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: [{ type: 'EnforcementScan', id: 'LIST' }],
    }),
    submitScan: builder.mutation<ScanDetailResponse, EnforcementScanInput>({
      query: (body) => ({ url: '/enforcement/scan', method: 'POST', body }),
      invalidatesTags: [{ type: 'EnforcementScan', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useListScansQuery, useSubmitScanMutation } = enforcementApi;
