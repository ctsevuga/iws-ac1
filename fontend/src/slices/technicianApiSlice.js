import { apiSlice } from './apiSlice';
import { TECHNICIANS_URL } from '../constants';

export const technicianApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * Create Technician
     */
    createTechnician: builder.mutation({
      query: (data) => ({
        url: `${TECHNICIANS_URL}`,
        method: 'POST',
        body: {
          user: data.user, // ✅ NEW

          name: data.name,
          phone: data.phone,
          email: data.email,

          skills: data.skills,

          isAvailable: data.isAvailable,

          currentLocation: data.currentLocation,

          areas: data.areas,
        },
      }),
      invalidatesTags: ['Technician'],
    }),

    /**
     * Get all technicians (company scoped)
     */
    getTechnicians: builder.query({
      query: ({
        page = 1,
        limit = 20,
        skill,
        isAvailable,
        area,
      } = {}) => {

        let url =
          `${TECHNICIANS_URL}?page=${page}&limit=${limit}`;

        if (skill) {
          url += `&skill=${skill}`;
        }

        if (isAvailable !== undefined) {
          url += `&isAvailable=${isAvailable}`;
        }

        if (area) {
          url += `&area=${area}`;
        }

        return { url };
      },

      providesTags: ['Technician'],

      keepUnusedDataFor: 5,
    }),

    /**
     * Get technician by ID
     */
    getTechnicianDetails: builder.query({
      query: (id) => ({
        url: `${TECHNICIANS_URL}/${id}`,
      }),

      providesTags: ['Technician'],

      keepUnusedDataFor: 5,
    }),

    /**
     * Update technician
     */
    updateTechnician: builder.mutation({
      query: (data) => ({
        url: `${TECHNICIANS_URL}/${data.technicianId}`,

        method: 'PUT',

        body: {
          user: data.user, // ✅ NEW

          name: data.name,
          phone: data.phone,
          email: data.email,

          skills: data.skills,

          isAvailable: data.isAvailable,

          currentLocation: data.currentLocation,

          areas: data.areas,
        },
      }),

      invalidatesTags: ['Technician'],
    }),

    /**
     * Update availability
     */
    updateTechnicianAvailability: builder.mutation({
      query: (data) => ({
        url:
          `${TECHNICIANS_URL}/${data.technicianId}/availability`,

        method: 'PATCH',

        body: {
          isAvailable: data.isAvailable,
        },
      }),

      invalidatesTags: ['Technician'],
    }),

    /**
     * Update location
     */
    updateTechnicianLocation: builder.mutation({
      query: (data) => ({
        url:
          `${TECHNICIANS_URL}/${data.technicianId}/location`,

        method: 'PATCH',

        body: {
          lat: data.lat,
          lng: data.lng,
        },
      }),

      invalidatesTags: ['Technician'],
    }),

    /**
     * Delete technician
     * Manager / Dispatcher only
     */
    deleteTechnician: builder.mutation({
      query: (technicianId) => ({
        url: `${TECHNICIANS_URL}/${technicianId}`,

        method: 'DELETE',
      }),

      invalidatesTags: ['Technician'],
    }),

  }),
});

export const {
  useCreateTechnicianMutation,

  useGetTechniciansQuery,
  useGetTechnicianDetailsQuery,

  useUpdateTechnicianMutation,

  useUpdateTechnicianAvailabilityMutation,
  useUpdateTechnicianLocationMutation,

  useDeleteTechnicianMutation,
} = technicianApiSlice;