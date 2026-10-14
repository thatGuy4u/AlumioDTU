import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../utils/constants';

/**
 * Creates an authenticated base query with automatic token refresh.
 *
 * This is the single source of truth for all RTK Query API calls.
 * It attaches the Bearer token from the Redux store, and on 401
 * responses, attempts a token refresh before retrying the request.
 *
 * This eliminates the dual HTTP client problem — use this baseQuery
 * for all RTK Query APIs instead of duplicating fetchBaseQuery config.
 */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Token refresh base query (separate to avoid infinite loops)
const refreshBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
});

// Track in-flight refresh to avoid duplicate refresh calls
let refreshPromise = null;

export async function baseQueryWithReauth(args, api, extraOptions) {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Don't attempt refresh for auth endpoints themselves
    const url = typeof args === 'string' ? args : args.url;
    const skipPaths = ['/auth/login', '/auth/register', '/auth/refresh-token'];
    if (skipPaths.some(p => url?.includes(p))) {
      return result;
    }

    // If a refresh is already in progress, wait for it
    if (!refreshPromise) {
      refreshPromise = refreshBaseQuery(
        { url: '/auth/refresh-token', method: 'POST' },
        api,
        extraOptions,
      );
    }

    const refreshResult = await refreshPromise;
    refreshPromise = null;

    if (refreshResult.data?.data?.accessToken) {
      // Store the new access token in Redux
      const { setCredentials } = await import('../slices/authSlice');
      const currentState = api.getState().auth;
      api.dispatch(setCredentials({
        user: currentState.user,
        accessToken: refreshResult.data.data.accessToken,
        profile: currentState.profile,
      }));

      // Retry the original request with the new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed — log the user out
      const { clearCredentials } = await import('../slices/authSlice');
      api.dispatch(clearCredentials());
    }
  }

  return result;
}
