import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import { BYPASS_AUTH_FOR_TESTING, MOCK_TEST_USER } from '../../utils/constants';

// Restore token from localStorage on app load
// const savedToken = localStorage.getItem('alumiodtu_token');
// const savedUser = localStorage.getItem('alumiodtu_user');

const savedToken = BYPASS_AUTH_FOR_TESTING ? 'test-token-bypass' : localStorage.getItem('alumiodtu_token');
const savedUser = BYPASS_AUTH_FOR_TESTING
  ? JSON.stringify(MOCK_TEST_USER)
  : localStorage.getItem('alumiodtu_user');

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : (BYPASS_AUTH_FOR_TESTING ? MOCK_TEST_USER : null),
  token: savedToken || (BYPASS_AUTH_FOR_TESTING ? 'test-token-bypass' : null),
  profile: null,
  // isAuthenticated: !!savedToken,
  isAuthenticated: BYPASS_AUTH_FOR_TESTING ? true : !!savedToken,
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
      localStorage.setItem('alumiodtu_token', accessToken);
      localStorage.setItem('alumiodtu_user', JSON.stringify(user));
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.profile = null;
      state.isAuthenticated = false;
      localStorage.removeItem('alumiodtu_token');
      localStorage.removeItem('alumiodtu_user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('alumiodtu_user', JSON.stringify(state.user));
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
          localStorage.setItem('alumiodtu_token', payload.data.accessToken);
          localStorage.setItem('alumiodtu_user', JSON.stringify(payload.data.user));
        }
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
        if (payload.success) {
          state.user = payload.data.user;
          state.token = payload.data.accessToken;
          state.isAuthenticated = true;
          localStorage.setItem('alumiodtu_token', payload.data.accessToken);
          localStorage.setItem('alumiodtu_user', JSON.stringify(payload.data.user));
        }
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        if (payload.success) {
          state.user = payload.data.user;
          state.profile = payload.data.profile;
          localStorage.setItem('alumiodtu_user', JSON.stringify(payload.data.user));
        }
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.profile = null;
        state.isAuthenticated = false;
        localStorage.removeItem('alumiodtu_token');
        localStorage.removeItem('alumiodtu_user');
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
