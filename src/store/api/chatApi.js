import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/chat`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['UnreadCount'],
  endpoints: (builder) => ({
    getUnreadCount: builder.query({
      query: () => '/unread-count',
      providesTags: ['UnreadCount'],
      // Re-fetch every 30 seconds while the component is mounted
      pollingInterval: 30000,
    }),
  }),
});

export const { useGetUnreadCountQuery } = chatApi;
