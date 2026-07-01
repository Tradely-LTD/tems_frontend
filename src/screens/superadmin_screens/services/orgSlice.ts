/**
 * @module superadmin_screens
 * @depends store/emptyApi
 * @routes /api/orgs
 */
import { emptyApi } from '@/store/emptyApi';
import type { OrgListResponse, OrgDetailResponse, UpdateOrgInput, CreateOrgInput } from './types';

const orgApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    listOrgs: builder.query<OrgListResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/orgs',
        params: { page: params?.page ?? 1, limit: params?.limit ?? 50 },
      }),
      providesTags: [{ type: 'Org', id: 'LIST' }],
    }),
    getOrg: builder.query<OrgDetailResponse, string>({
      query: (id) => `/orgs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Org', id }],
    }),
    updateOrg: builder.mutation<OrgDetailResponse, { id: string; body: UpdateOrgInput }>({
      query: ({ id, body }) => ({ url: `/orgs/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Org', id: 'LIST' },
        { type: 'Org', id },
      ],
    }),
    createOrg: builder.mutation<OrgDetailResponse, CreateOrgInput>({
      query: (body) => ({ url: '/orgs', method: 'POST', body }),
      invalidatesTags: [{ type: 'Org', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useListOrgsQuery, useGetOrgQuery, useUpdateOrgMutation, useCreateOrgMutation } = orgApi;
