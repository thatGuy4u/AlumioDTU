import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

// ─── localStorage helpers (single source of truth) ───
const TOKEN_KEY = 'alumiodtu_token';
const USER_KEY = 'alumiodtu_user';

function persistAuth(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearPersistedAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Restore from localStorage on app load
const savedToken = localStorage.getItem(TOKEN_KEY);
const savedUser = localStorage.getItem(USER_KEY);

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  profile: null,
  isAuthenticated: !!savedToken,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, profile } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.profile = profile || null;
      state.isAuthenticated = true;
      persistAuth(accessToken, user);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.profile = null;
      state.isAuthenticated = false;
      clearPersistedAuth();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Auto-set credentials on successful login/register
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        if (payload.success) {
          state.user = payload.data.user;
          state.token = payload.data.accessToken;
          state.isAuthenticated = true;
          persistAuth(payload.data.accessToken, payload.data.user);
        }
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
        if (payload.success) {
          state.user = payload.data.user;
          state.token = payload.data.accessToken;
          state.isAuthenticated = true;
          persistAuth(payload.data.accessToken, payload.data.user);
        }
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        if (payload.success) {
          state.user = payload.data.user;
          state.profile = payload.data.profile;
          localStorage.setItem(USER_KEY, JSON.stringify(payload.data.user));
        }
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.profile = null;
        state.isAuthenticated = false;
        clearPersistedAuth();
      });
  },
});

export const { setCredentials, clearCredentials, updateUser, setProfile } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectToken = (state) => state.auth.token;
export const selectProfile = (state) => state.auth.profile;
