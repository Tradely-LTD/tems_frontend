/**
 * @module superadmin_screens
 * @depends store/emptyApi
 * @routes /api/revenue-rules
 */
import { emptyApi } from '@/store/emptyApi';
import type {
  RevenueAuthority,
  CreateAuthorityInput,
  UpdateAuthorityInput,
  AuthorityListResponse,
  AuthorityDetailResponse,
  AddContactInput,
  AuthorityAdminContact,
  RevenueRule,
  CreateRuleInput,
  UpdateRuleInput,
  RuleListParams,
  RuleListResponse,
  RuleDetailResponse,
  PreviewRulesInput,
  PreviewRulesResult,
  LevyLineListParams,
  LevyLineListResponse,
  WaybillLevyLine,
} from './types';

const revenueRulesApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Authorities ──────────────────────────────────────────────────────────
    listAuthorities: builder.query<AuthorityListResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/revenue-rules/authorities',
        params: { page: params?.page ?? 1, limit: params?.limit ?? 50 },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map((a) => ({ type: 'RevenueAuthority' as const, id: a.id })),
              { type: 'RevenueAuthority' as const, id: 'LIST' },
            ]
          : [{ type: 'RevenueAuthority' as const, id: 'LIST' }],
    }),
    getAuthority: builder.query<AuthorityDetailResponse, string>({
      query: (id) => `/revenue-rules/authorities/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'RevenueAuthority', id }],
    }),
    createAuthority: builder.mutation<AuthorityDetailResponse, CreateAuthorityInput>({
      query: (body) => ({ url: '/revenue-rules/authorities', method: 'POST', body }),
      invalidatesTags: [{ type: 'RevenueAuthority', id: 'LIST' }],
    }),
    updateAuthority: builder.mutation<AuthorityDetailResponse, { id: string; body: UpdateAuthorityInput }>({
      query: ({ id, body }) => ({ url: `/revenue-rules/authorities/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RevenueAuthority', id }, { type: 'RevenueAuthority', id: 'LIST' }],
    }),
    deactivateAuthority: builder.mutation<AuthorityDetailResponse, string>({
      query: (id) => ({ url: `/revenue-rules/authorities/${id}/deactivate`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'RevenueAuthority', id }, { type: 'RevenueAuthority', id: 'LIST' }],
    }),
    verifyBank: builder.mutation<AuthorityDetailResponse, string>({
      // Endpoint requires bank_code/account_number in body per its Zod schema, but the
      // service implementation ignores the body and re-verifies the authority's
      // already-saved bank details. We still satisfy the schema with placeholder values.
      query: (id) => ({
        url: `/revenue-rules/authorities/${id}/verify-bank`,
        method: 'POST',
        body: { bank_code: '000', account_number: '0000000000' },
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'RevenueAuthority', id }],
    }),
    uploadComplianceDoc: builder.mutation<AuthorityDetailResponse, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: `/revenue-rules/authorities/${id}/compliance-doc`, method: 'POST', body: formData };
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RevenueAuthority', id }],
    }),
    addContact: builder.mutation<{ success: boolean; data: AuthorityAdminContact }, AddContactInput>({
      query: ({ authorityId, userId, role }) => ({
        url: `/revenue-rules/authorities/${authorityId}/contacts/${userId}`,
        method: 'POST',
        body: { role },
      }),
      invalidatesTags: (_r, _e, { authorityId }) => [{ type: 'RevenueAuthority', id: authorityId }],
    }),
    removeContact: builder.mutation<{ success: boolean }, { authorityId: string; userId: string }>({
      query: ({ authorityId, userId }) => ({
        url: `/revenue-rules/authorities/${authorityId}/contacts/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { authorityId }) => [{ type: 'RevenueAuthority', id: authorityId }],
    }),

    // ── Rules ────────────────────────────────────────────────────────────────
    listRules: builder.query<RuleListResponse, RuleListParams | void>({
      query: (params) => ({
        url: '/revenue-rules/rules',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          ...(params?.authority_id ? { authority_id: params.authority_id } : {}),
          ...(params?.scope ? { scope: params.scope } : {}),
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map((r) => ({ type: 'RevenueRule' as const, id: r.id })),
              { type: 'RevenueRule' as const, id: 'LIST' },
            ]
          : [{ type: 'RevenueRule' as const, id: 'LIST' }],
    }),
    getRule: builder.query<RuleDetailResponse, string>({
      query: (id) => `/revenue-rules/rules/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'RevenueRule', id }],
    }),
    createRule: builder.mutation<RuleDetailResponse, CreateRuleInput>({
      query: (body) => ({ url: '/revenue-rules/rules', method: 'POST', body }),
      invalidatesTags: [{ type: 'RevenueRule', id: 'LIST' }],
    }),
    updateRule: builder.mutation<RuleDetailResponse, { id: string; body: UpdateRuleInput }>({
      query: ({ id, body }) => ({ url: `/revenue-rules/rules/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RevenueRule', id }, { type: 'RevenueRule', id: 'LIST' }],
    }),
    previewRules: builder.mutation<{ success: boolean; data: PreviewRulesResult }, PreviewRulesInput>({
      query: (body) => ({ url: '/revenue-rules/rules/preview', method: 'POST', body }),
    }),

    // ── Levy lines ───────────────────────────────────────────────────────────
    listLevyLines: builder.query<LevyLineListResponse, LevyLineListParams | void>({
      query: (params) => ({
        url: '/revenue-rules/levy-lines',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          ...(params?.disb_status ? { disb_status: params.disb_status } : {}),
          ...(params?.authority_id ? { authority_id: params.authority_id } : {}),
        },
      }),
      providesTags: [{ type: 'LevyLine', id: 'LIST' }],
    }),
    getWaybillLevyLines: builder.query<{ success: boolean; data: WaybillLevyLine[] }, string>({
      query: (waybillId) => `/revenue-rules/levy-lines/${waybillId}`,
      providesTags: (_r, _e, waybillId) => [{ type: 'LevyLine', id: waybillId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListAuthoritiesQuery,
  useGetAuthorityQuery,
  useCreateAuthorityMutation,
  useUpdateAuthorityMutation,
  useDeactivateAuthorityMutation,
  useVerifyBankMutation,
  useUploadComplianceDocMutation,
  useAddContactMutation,
  useRemoveContactMutation,
  useListRulesQuery,
  useGetRuleQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  usePreviewRulesMutation,
  useListLevyLinesQuery,
  useGetWaybillLevyLinesQuery,
} = revenueRulesApi;

export type { RevenueAuthority, RevenueRule };
