import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { emptyApi } from '@/store/emptyApi';
import type {
  LoginResponse,
  MessageResponse,
  UserData,
  OtpSendRequest,
  OtpVerifyRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshRequest,
} from './types';

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: UserData | null;
  phone_confirmed: boolean;
}

const initialState: AuthState = {
  access_token: null,
  refresh_token: null,
  user: null,
  phone_confirmed: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse['data']>) => {
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.user = action.payload.user;
      state.phone_confirmed = action.payload.user.phone_verified;
    },
    setTokens: (state, action: PayloadAction<{ access_token: string; refresh_token: string }>) => {
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
    },
    setPhoneConfirmed: (state) => {
      state.phone_confirmed = true;
      if (state.user) state.user.phone_verified = true;
    },
    clearAuth: (state) => {
      state.access_token = null;
      state.refresh_token = null;
      state.user = null;
      state.phone_confirmed = false;
    },
  },
});

export const { setCredentials, setTokens, setPhoneConfirmed, clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;

const authApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.data));
        } catch {
          // ignore
        }
      },
    }),
    sendOtp: builder.mutation<MessageResponse, OtpSendRequest>({
      query: (body) => ({ url: '/auth/otp/send', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation<MessageResponse, OtpVerifyRequest>({
      query: (body) => ({ url: '/auth/otp/verify', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(setPhoneConfirmed());
        } catch {
          // ignore
        }
      },
    }),
    refreshToken: builder.mutation<{ data: { access_token: string; refresh_token: string } }, RefreshRequest>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
    logout: builder.mutation<MessageResponse, { refresh_token: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // ignore
        }
        dispatch(clearAuth());
      },
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
