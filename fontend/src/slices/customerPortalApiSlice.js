import { apiSlice } from "./apiSlice";
import { CUSTOMERPORTAL_URL } from "../constants";

export const customerPortalApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({

      /**
       * ==================================================
       * PORTAL SETTINGS
       * ==================================================
       */

      /**
       * Get Portal Settings
       * Access: manager, dispatcher
       */
      getPortalSettings: builder.query({
        query: () => ({
          url: `${CUSTOMERPORTAL_URL}`,
        }),

        providesTags: ["CustomerPortal"],
        keepUnusedDataFor: 5,
      }),
getPortalAnnouncements: builder.query({
  query: () => ({
    url: `${CUSTOMERPORTAL_URL}/announcements`,
  }),

  providesTags: ["Announcements"],

  keepUnusedDataFor: 5,
}),
      /**
       * Create Portal Settings
       * Access: manager
       */
      createPortalSettings: builder.mutation({
  query: (data) => ({
    url: CUSTOMERPORTAL_URL,
    method: "POST",
    body: data,
  }),

  invalidatesTags: ["CustomerPortal"],
}),

      /**
       * Update Portal Settings
       * Access: manager
       */
      updatePortalSettings: builder.mutation({
        query: (data) => ({
          url: `${CUSTOMERPORTAL_URL}`,
          method: "PUT",
          body: data,
        }),

        invalidatesTags: ["CustomerPortal"],
      }),

      /**
       * ==================================================
       * PUBLIC PORTAL
       * ==================================================
       */

      /**
       * Get Public Portal Settings
       * Public Access
       */
      getPublicPortalSettings: builder.query({
  query: (slug) => {
    const url = `${CUSTOMERPORTAL_URL}/public/${slug}`;

    console.log("🌐 RTK REQUEST URL:", url);

    return { url };
  },
}),

      /**
       * ==================================================
       * SERVICES
       * ==================================================
       */

      /**
       * Add Service
       * Access: manager
       */
      addService: builder.mutation({
        query: (data) => ({
          url: `${CUSTOMERPORTAL_URL}/services`,
          method: "POST",
          body: {
            title: data.title,
            description: data.description,
            image: data.image,
            displayOrder: data.displayOrder,
          },
        }),

        invalidatesTags: ["CustomerPortal"],
      }),

      /**
       * Update Service
       * Access: manager
       */
      updateService: builder.mutation({
        query: (data) => ({
          url: `${CUSTOMERPORTAL_URL}/services/${data.serviceId}`,
          method: "PUT",
          body: {
            title: data.title,
            description: data.description,
            image: data.image,
            displayOrder: data.displayOrder,
            active: data.active,
          },
        }),

        invalidatesTags: ["CustomerPortal"],
      }),

      /**
       * Delete Service
       * Access: manager
       */
      deleteService: builder.mutation({
        query: (serviceId) => ({
          url: `${CUSTOMERPORTAL_URL}/services/${serviceId}`,
          method: "DELETE",
        }),

        invalidatesTags: ["CustomerPortal"],
      }),

      /**
       * ==================================================
       * SPECIAL SERVICES
       * ==================================================
       */

      /**
       * Add Special Service
       * Access: manager
       */
      addSpecialService: builder.mutation({
        query: (data) => ({
          url: `${CUSTOMERPORTAL_URL}/special-services`,
          method: "POST",
          body: {
            title: data.title,
            description: data.description,
            icon: data.icon,
            active: data.active,
          },
        }),

        invalidatesTags: ["CustomerPortal"],
      }),

      /**
       * Update Special Service
       * Access: manager
       */
      updateSpecialService: builder.mutation({
        query: (data) => ({
          url: `${CUSTOMERPORTAL_URL}/special-services/${data.id}`,
          method: "PUT",
          body: {
            title: data.title,
            description: data.description,
            icon: data.icon,
            active: data.active,
          },
        }),

        invalidatesTags: ["CustomerPortal"],
      }),

      /**
       * Delete Special Service
       * Access: manager
       */
      deleteSpecialService: builder.mutation({
        query: (id) => ({
          url: `${CUSTOMERPORTAL_URL}/special-services/${id}`,
          method: "DELETE",
        }),

        invalidatesTags: ["CustomerPortal"],
      }),

      /**
       * ==================================================
       * ANNOUNCEMENTS
       * ==================================================
       */

      /**
       * Add Announcement
       * Access: manager
       */
      addAnnouncement: builder.mutation({
        query: (data) => ({
          url: `${CUSTOMERPORTAL_URL}/announcements`,
          method: "POST",
          body: {
            title: data.title,
            message: data.message,
            startDate: data.startDate,
            endDate: data.endDate,
            active: data.active,
          },
        }),

        invalidatesTags: ["CustomerPortal"],
      }),
getAnnouncementById: builder.query({
  query: (id) => ({
    url: `${CUSTOMERPORTAL_URL}/announcements/${id}`,
  }),

  providesTags: (result, error, id) => [
    { type: "CustomerPortal", id },
  ],

  keepUnusedDataFor: 5,
}),
      /**
       * Update Announcement
       * Access: manager
       */
      updateAnnouncement: builder.mutation({
        query: (data) => ({
          url: `${CUSTOMERPORTAL_URL}/announcements/${data.id}`,
          method: "PUT",
          body: {
            title: data.title,
            message: data.message,
            startDate: data.startDate,
            endDate: data.endDate,
            active: data.active,
          },
        }),

        invalidatesTags: ["CustomerPortal"],
      }),

      /**
       * Delete Announcement
       * Access: manager
       */
      deleteAnnouncement: builder.mutation({
        query: (id) => ({
          url: `${CUSTOMERPORTAL_URL}/announcements/${id}`,
          method: "DELETE",
        }),

        invalidatesTags: ["CustomerPortal"],
      }),
    }),
  });

export const {
  /**
   * Portal Settings
   */
  useGetPortalSettingsQuery,
  useCreatePortalSettingsMutation,
  useUpdatePortalSettingsMutation,

  /**
   * Public Portal
   */
  useGetPublicPortalSettingsQuery,

  /**
   * Services
   */
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,

  /**
   * Special Services
   */
  useAddSpecialServiceMutation,
  useUpdateSpecialServiceMutation,
  useDeleteSpecialServiceMutation,

  /**
   * Announcements
   */
  useGetPortalAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useAddAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = customerPortalApiSlice;