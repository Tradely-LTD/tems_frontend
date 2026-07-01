/**
 * @module identity_screens
 * @depends store/emptyApi
 * @routes /api/identity/kyc/status, /api/identity/profile, /api/identity/kyc/documents, /api/identity/admin/submissions, /api/identity/:id/review
 */
import { emptyApi } from '@/store/emptyApi';
import type {
  KycStatusResponse,
  IdentityProfileResponse,
  SubmitProfileRequest,
  SubmitDocumentRequest,
  SubmitDocumentResponse,
  SubmissionsResponse,
  ReviewRequest,
  ReviewResponse,
} from './types';

const identityApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getKycStatus: builder.query<KycStatusResponse, void>({
      query: () => '/identity/kyc/status',
      providesTags: [{ type: 'Identity', id: 'STATUS' }],
    }),
    getIdentityProfile: builder.query<IdentityProfileResponse, void>({
      query: () => '/identity/profile',
      providesTags: [{ type: 'Identity', id: 'PROFILE' }],
    }),
    submitProfile: builder.mutation<IdentityProfileResponse, SubmitProfileRequest>({
      query: (body) => ({ url: '/identity/profile', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Identity', id: 'PROFILE' },
        { type: 'Identity', id: 'STATUS' },
      ],
    }),
    submitDocument: builder.mutation<SubmitDocumentResponse, SubmitDocumentRequest>({
      query: (body) => ({ url: '/identity/kyc/documents', method: 'POST', body }),
      invalidatesTags: [{ type: 'Identity', id: 'STATUS' }],
    }),

    getAdminSubmissions: builder.query<
      SubmissionsResponse,
      { page: number; limit: number; kyc_status: string }
    >({
      query: ({ page, limit, kyc_status }) =>
        `/identity/admin/submissions?page=${page}&limit=${limit}&kyc_status=${kyc_status}`,
      providesTags: [{ type: 'Identity', id: 'ADMIN_QUEUE' }],
    }),

    reviewIdentity: builder.mutation<ReviewResponse, { id: string; body: ReviewRequest }>({
      query: ({ id, body }) => ({ url: `/identity/${id}/review`, method: 'PATCH', body }),
      invalidatesTags: [
        { type: 'Identity', id: 'ADMIN_QUEUE' },
        { type: 'Identity', id: 'STATUS' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetKycStatusQuery,
  useGetIdentityProfileQuery,
  useSubmitProfileMutation,
  useSubmitDocumentMutation,
  useGetAdminSubmissionsQuery,
  useReviewIdentityMutation,
} = identityApi;
