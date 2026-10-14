import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UnreadCount'],
  endpoints: (builder) => ({
    getUnreadCount: builder.query({
      query: () => '/chat/unread-count',
      providesTags: ['UnreadCount'],
      // Re-fetch every 30 seconds while the component is mounted
      pollingInterval: 30000,
    }),
  }),
});

export const { useGetUnreadCountQuery } = chatApi;
