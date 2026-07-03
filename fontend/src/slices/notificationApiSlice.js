import { apiSlice } from './apiSlice';
import { NOTIFICATIONS_URL } from '../constants';

export const notificationApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({

      /**
       * Get notifications
       *
       * Technician:
       *   - own notifications only
       *
       * Manager / Dispatcher:
       *   - all technician notifications
       *   - optional technician filter
       */
      getNotifications: builder.query({
        query: ({
          page = 1,
          limit = 20,
          status,
          technician,
        } = {}) => {
          let url =
            `${NOTIFICATIONS_URL}` +
            `?page=${page}&limit=${limit}`;

          if (status) {
            url += `&status=${status}`;
          }

          if (technician) {
            url += `&technician=${technician}`;
          }

          return {
            url,
          };
        },

        providesTags: ['Notification'],
        keepUnusedDataFor: 5,
      }),

      /**
       * Get single notification
       */
      getNotificationDetails: builder.query({
        query: (id) => ({
          url: `${NOTIFICATIONS_URL}/${id}`,
        }),

        providesTags: ['Notification'],
        keepUnusedDataFor: 5,
      }),

      /**
       * Mark notification as read
       *
       * Technician only
       */
      markNotificationAsRead: builder.mutation({
        query: (id) => ({
          url: `${NOTIFICATIONS_URL}/${id}/read`,
          method: 'PATCH',
        }),

        invalidatesTags: ['Notification'],
      }),
      getUnreadNotificationCount: builder.query({
  query: () => ({
    url: `${NOTIFICATIONS_URL}/unread-count`,
  }),

  providesTags: ['Notification'],
  keepUnusedDataFor: 5,
}),

    }),
  });

export const {
  useGetNotificationsQuery,
  useGetNotificationDetailsQuery,
  useMarkNotificationAsReadMutation,
  useGetUnreadNotificationCountQuery,
} = notificationApiSlice;