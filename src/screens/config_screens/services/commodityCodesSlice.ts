/**
 * @module config_screens
 * @depends store/emptyApi
 * @routes /api/commodities
 */
import { emptyApi } from '@/store/emptyApi';
import type { Commodity, CreateCommodityInput, UpdateCommodityInput } from './types';

const commodityCodesApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommodities: builder.query<{ success: boolean; data: Commodity[] }, void>({
      query: () => '/commodities/admin/all',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({ type: 'Commodity' as const, id: c.id })),
              { type: 'Commodity', id: 'LIST' },
            ]
          : [{ type: 'Commodity', id: 'LIST' }],
    }),
    createCommodity: builder.mutation<{ success: boolean; data: Commodity }, CreateCommodityInput>({
      query: (body) => ({ url: '/commodities', method: 'POST', body }),
      invalidatesTags: [{ type: 'Commodity', id: 'LIST' }],
    }),
    updateCommodity: builder.mutation<
      { success: boolean; data: Commodity },
      { id: string; body: UpdateCommodityInput }
    >({
      query: ({ id, body }) => ({ url: `/commodities/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Commodity', id },
        { type: 'Commodity', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommoditiesQuery,
  useCreateCommodityMutation,
  useUpdateCommodityMutation,
} = commodityCodesApi;
