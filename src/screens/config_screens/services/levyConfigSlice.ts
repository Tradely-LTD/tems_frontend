/**
 * @module config_screens
 * @depends store/emptyApi
 * @routes /api/config/levy
 */
import { emptyApi } from '@/store/emptyApi';
import type { LevyConfig, LevyConfigInput } from './types';

const levyConfigApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getLevyConfig: builder.query<{ success: boolean; data: LevyConfig }, void>({
      query: () => '/config/levy',
      providesTags: [{ type: 'LevyConfig', id: 'SINGLETON' }],
    }),
    upsertLevyConfig: builder.mutation<{ success: boolean; data: LevyConfig }, LevyConfigInput>({
      query: (body) => ({ url: '/config/levy', method: 'PUT', body }),
      invalidatesTags: [{ type: 'LevyConfig', id: 'SINGLETON' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLevyConfigQuery, useUpsertLevyConfigMutation } = levyConfigApi;
