import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

const rawQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth?: { access_token?: string | null } };
    const token = state.auth?.access_token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await rawQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const state = api.getState() as {
          auth?: { refresh_token?: string | null };
        };
        const refreshToken = state.auth?.refresh_token;
        if (!refreshToken) {
          const { clearAuth } =
            await import("@/screens/auth_screens/services/authSlice");
          api.dispatch(clearAuth());
          return result;
        }
        const refreshResult = await rawQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: { refresh_token: refreshToken },
          },
          api,
          extraOptions,
        );
        if (refreshResult.data) {
          const { setTokens } =
            await import("@/screens/auth_screens/services/authSlice");
          api.dispatch(
            setTokens(
              (
                refreshResult.data as {
                  data: { access_token: string; refresh_token: string };
                }
              ).data,
            ),
          );
          result = await rawQuery(args, api, extraOptions);
        } else {
          const { clearAuth } =
            await import("@/screens/auth_screens/services/authSlice");
          api.dispatch(clearAuth());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawQuery(args, api, extraOptions);
    }
  }

  return result;
};
