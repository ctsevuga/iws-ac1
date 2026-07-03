import { apiSlice } from './apiSlice';
import { ACTIVITIES_URL } from '../constants';

export const activityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * Create Activity
     */
    createActivity: builder.mutation({
      query: (data) => ({
        url: `${ACTIVITIES_URL}`,
        method: 'POST',
        body: data, // { entityType, entityId, action, message }
      }),
      invalidatesTags: ['Activity'],
    }),

    /**
     * Get all activities (company scoped + pagination + filters)
     */
    getActivities: builder.query({
      query: ({ page = 1, limit = 20, entityType, entityId } = {}) => {
        let url = `${ACTIVITIES_URL}?page=${page}&limit=${limit}`;

        if (entityType) url += `&entityType=${entityType}`;
        if (entityId) url += `&entityId=${entityId}`;

        return {
          url,
        };
      },
      providesTags: ['Activity'],
      keepUnusedDataFor: 5,
    }),

    /**
     * Get single activity by ID
     */
    getActivityDetails: builder.query({
      query: (id) => ({
        url: `${ACTIVITIES_URL}/${id}`,
      }),
      providesTags: ['Activity'],
      keepUnusedDataFor: 5,
    }),

    /**
     * Get activities for a specific entity (timeline view)
     */
    getEntityActivities: builder.query({
      query: ({ entityType, entityId }) => ({
        url: `${ACTIVITIES_URL}/entity/${entityType}/${entityId}`,
      }),
      providesTags: ['Activity'],
      keepUnusedDataFor: 5,
    }),

    /**
     * Delete activity (admin only)
     */
    deleteActivity: builder.mutation({
      query: (id) => ({
        url: `${ACTIVITIES_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Activity'],
    }),

  }),
});

export const {
  useCreateActivityMutation,

  useGetActivitiesQuery,
  useGetActivityDetailsQuery,
  useGetEntityActivitiesQuery,

  useDeleteActivityMutation,
} = activityApiSlice;