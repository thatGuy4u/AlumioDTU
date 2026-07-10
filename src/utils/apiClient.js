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

/**
 * Set (or clear) the auth token used for all future requests.
 * Called from authSlice listeners / App init.
 */
export function setAuthToken(token) {
  _token = token;
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

// Response interceptor — standardise error shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returned a structured error, forward the message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  },
);

export default api;
