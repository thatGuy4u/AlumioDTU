import axios from 'axios';
import { API_URL } from './constants';

/**
 * Centralized Axios instance for all API calls.
 *
 * Usage:
 *   import api from '../utils/apiClient';
 *   const res = await api.get('/users/me');
 *
 * Auth token is attached automatically via interceptor.
 * To set the token (call once after login / store init):
 *   import { setAuthToken } from '../utils/apiClient';
 *   setAuthToken(token);
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies (refreshToken)
  headers: { 'Content-Type': 'application/json' },
});

// In-memory token reference — set via setAuthToken()
let _token = null;

// Store reference for dispatching auth actions (set via setStore)
let _store = null;

/**
 * Set (or clear) the auth token used for all future requests.
 * Called from authSlice listeners / App init.
 */
export function setAuthToken(token) {
  _token = token;
}

/**
 * Set the Redux store reference so the interceptor can dispatch
 * clearCredentials on unrecoverable auth failures.
 */
export function setStore(store) {
  _store = store;
}

// Request interceptor — attach Bearer token to every request
api.interceptors.request.use(
  (config) => {
    if (_token) {
      config.headers.Authorization = `Bearer ${_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Track whether a token refresh is already in progress
let _isRefreshing = false;
let _refreshSubscribers = [];

function onRefreshed(newToken) {
  _refreshSubscribers.forEach(cb => cb(newToken));
  _refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  _refreshSubscribers.push(cb);
}

// Response interceptor — auto-refresh token on 401, standardise error shape
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh on login/register/refresh-token endpoints
      const skipRefreshPaths = ['/auth/login', '/auth/register', '/auth/refresh-token'];
      if (skipRefreshPaths.some(p => originalRequest.url?.includes(p))) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!_isRefreshing) {
        _isRefreshing = true;

        try {
          // Attempt to refresh using the httpOnly refresh token cookie
          const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
            withCredentials: true,
          });

          const newToken = res.data.data.accessToken;
          _token = newToken;

          // Update Redux store with new token
          if (_store) {
            const { setCredentials } = await import('../store/slices/authSlice');
            const currentState = _store.getState().auth;
            _store.dispatch(setCredentials({
              user: currentState.user,
              accessToken: newToken,
              profile: currentState.profile,
            }));
          }

          _isRefreshing = false;
          onRefreshed(newToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          _isRefreshing = false;
          _refreshSubscribers = [];

          // Refresh token also expired/invalid — clear session and redirect to login
          if (_store) {
            const { clearCredentials } = await import('../store/slices/authSlice');
            _store.dispatch(clearCredentials());
          }

          // Redirect to login page
          window.location.href = '/auth/login';

          return Promise.reject(refreshError);
        }
      } else {
        // A refresh is already in progress — queue this request
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
    }

    // If the server returned a structured error, forward the message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  },
);

export default api;
