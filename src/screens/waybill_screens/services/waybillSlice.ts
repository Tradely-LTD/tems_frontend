/**
 * @module waybill_screens
 * @depends store/emptyApi
 * @routes /api/waybills, /api/levy, /api/payments
 */
import { emptyApi } from '@/store/emptyApi';
import type {
  WaybillListResponse,
  WaybillDetailResponse,
  WaybillListParams,
  CreateWaybillRequest,
  CreateWaybillResponse,
  CancelDisputeRequest,
  CancelDisputeResponse,
  LevyCalculateRequest,
  LevyCalculateResponse,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
} from './types';

const waybillApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getWaybills: builder.query<WaybillListResponse, WaybillListParams>({
      query: (params) => ({
        url: '/waybills',
        params: { page: params.page ?? 1, limit: params.limit ?? 20, ...params },
      }),
      providesTags: ['Waybill'],
    }),
    getWaybill: builder.query<WaybillDetailResponse, string>({
      query: (id) => `/waybills/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Waybill', id }],
    }),
    createWaybill: builder.mutation<CreateWaybillResponse, CreateWaybillRequest>({
      query: (body) => ({ url: '/waybills', method: 'POST', body }),
      invalidatesTags: ['Waybill'],
    }),
    cancelWaybill: builder.mutation<CancelDisputeResponse, CancelDisputeRequest>({
      query: ({ id, reason }) => ({
        url: `/waybills/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Waybill'],
    }),
    disputeWaybill: builder.mutation<CancelDisputeResponse, CancelDisputeRequest>({
      query: ({ id, reason }) => ({
        url: `/waybills/${id}/dispute`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Waybill'],
    }),
    calculateLevy: builder.mutation<LevyCalculateResponse, LevyCalculateRequest>({
      query: (body) => ({ url: '/levy/calculate', method: 'POST', body }),
    }),
    initiatePayment: builder.mutation<InitiatePaymentResponse, InitiatePaymentRequest>({
      query: (body) => ({ url: '/payments/initiate', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWaybillsQuery,
  useGetWaybillQuery,
  useCreateWaybillMutation,
  useCancelWaybillMutation,
  useDisputeWaybillMutation,
  useCalculateLevyMutation,
  useInitiatePaymentMutation,
} = waybillApi;
