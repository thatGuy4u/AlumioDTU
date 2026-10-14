import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

const LAST_VISIT_KEY = 'alumio_community_last_visit';

export function getCommunityLastVisit() {
  return localStorage.getItem(LAST_VISIT_KEY) || null;
}

export function setCommunityLastVisit() {
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

export const communityApi = createApi({
  reducerPath: 'communityApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CommunityUnread'],
  endpoints: (builder) => ({
    getCommunityUnreadCount: builder.query({
      query: () => {
        const since = getCommunityLastVisit();
        return `/community/unread-count${since ? `?since=${encodeURIComponent(since)}` : ''}`;
      },
      providesTags: ['CommunityUnread'],
      // Re-fetch every 60 seconds while the component is mounted
      pollingInterval: 60000,
    }),
  }),
});

export const { useGetCommunityUnreadCountQuery } = communityApi;
