/**
 * @module superadmin_screens
 * @depends store/emptyApi
 * @routes /api/users
 */
import { emptyApi } from '@/store/emptyApi';
import type {
  UserListResponse,
  UserDetailResponse,
  CreatePlatformUserInput,
  UpdatePlatformUserInput,
  UpdatePermissionsInput,
  UpdatePermissionsResponse,
} from './types';

const userMgmtApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    listPlatformUsers: builder.query<UserListResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/users',
        params: { page: params?.page ?? 1, limit: params?.limit ?? 50 },
      }),
      providesTags: [{ type: 'Agent', id: 'USER_LIST' }],
    }),
    createPlatformUser: builder.mutation<UserDetailResponse, CreatePlatformUserInput>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'USER_LIST' }],
    }),
    updatePlatformUser: builder.mutation<UserDetailResponse, { id: string; body: UpdatePlatformUserInput }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Agent', id: 'USER_LIST' }],
    }),
    updateUserPermissions: builder.mutation<UpdatePermissionsResponse, { id: string; body: UpdatePermissionsInput }>({
      query: ({ id, body }) => ({ url: `/users/${id}/permissions`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Agent', id: 'USER_LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListPlatformUsersQuery,
  useCreatePlatformUserMutation,
  useUpdatePlatformUserMutation,
  useUpdateUserPermissionsMutation,
} = userMgmtApi;
