import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LAST_VISIT_KEY = 'alumio_community_last_visit';

export function getCommunityLastVisit() {
  return localStorage.getItem(LAST_VISIT_KEY) || null;
}

export function setCommunityLastVisit() {
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

export const communityApi = createApi({
  reducerPath: 'communityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/community`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['CommunityUnread'],
  endpoints: (builder) => ({
    getCommunityUnreadCount: builder.query({
      query: () => {
        const since = getCommunityLastVisit();
        return `/unread-count${since ? `?since=${encodeURIComponent(since)}` : ''}`;
      },
      providesTags: ['CommunityUnread'],
      // Re-fetch every 60 seconds while the component is mounted
      pollingInterval: 60000,
    }),
  }),
});

export const { useGetCommunityUnreadCountQuery } = communityApi;
