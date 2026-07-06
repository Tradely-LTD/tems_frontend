/**
 * @module profile_screens
 * @depends store/emptyApi
 * @routes /api/profile, /api/profile/change-password, /api/profile/change-email/initiate, /api/profile/change-email/confirm, /api/profile/settings
 */
import { emptyApi } from '@/store/emptyApi';
import type {
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  InitiateEmailChangeRequest,
  ConfirmEmailChangeRequest,
  UserSettingsResponse,
  UpdateSettingsRequest,
  MessageResponse,
} from './types';

const profileApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/profile',
      providesTags: [{ type: 'Profile', id: 'ME' }],
    }),
    updateProfile: builder.mutation<ProfileResponse, UpdateProfileRequest>({
      query: (body) => ({ url: '/profile', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),
    changePassword: builder.mutation<MessageResponse, ChangePasswordRequest>({
      query: (body) => ({ url: '/profile/change-password', method: 'POST', body }),
    }),
    initiateEmailChange: builder.mutation<MessageResponse, InitiateEmailChangeRequest>({
      query: (body) => ({ url: '/profile/change-email/initiate', method: 'POST', body }),
    }),
    confirmEmailChange: builder.mutation<MessageResponse, ConfirmEmailChangeRequest>({
      query: (body) => ({ url: '/profile/change-email/confirm', method: 'POST', body }),
    }),
    getSettings: builder.query<UserSettingsResponse, void>({
      query: () => '/profile/settings',
      providesTags: [{ type: 'Profile', id: 'SETTINGS' }],
    }),
    updateSettings: builder.mutation<UserSettingsResponse, UpdateSettingsRequest>({
      query: (body) => ({ url: '/profile/settings', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Profile', id: 'SETTINGS' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useInitiateEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = profileApi;
