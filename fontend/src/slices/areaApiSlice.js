import { apiSlice } from "./apiSlice";
import { AREAS_URL } from "../constants";

export const areaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ---------------------------------------------------------------------- */
    /*                              AREA CRUD                                 */
    /* ---------------------------------------------------------------------- */

    createArea: builder.mutation({
      query: (data) => ({
        url: `${AREAS_URL}`,
        method: "POST",
        body: {
          name: data.name,
          city: data.city, // only city now
        },
      }),
      invalidatesTags: ["Area"],
    }),

/* ---------------------------------------------------------------------- */

    getAreas: builder.query({
      query: ({ page = 1, limit = 100, search } = {}) => {
        let url = `${AREAS_URL}?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }

        return { url };
      },
      providesTags: ["Area"],
      keepUnusedDataFor: 5,
    }),

/* ---------------------------------------------------------------------- */

    getAreaDetails: builder.query({
      query: (id) => ({
        url: `${AREAS_URL}/${id}`,
      }),
      providesTags: ["Area"],
      keepUnusedDataFor: 5,
    }),

/* ---------------------------------------------------------------------- */

    getAreaOptions: builder.query({
      query: () => ({
        url: `${AREAS_URL}/options`,
      }),
      providesTags: ["Area"],
      keepUnusedDataFor: 5,
    }),

/* ---------------------------------------------------------------------- */

    getCompanyCities: builder.query({
      query: () => ({
        url: `${AREAS_URL}/cities/all`,
      }),
      providesTags: ["City"],
      keepUnusedDataFor: 5,
    }),

/* ---------------------------------------------------------------------- */

    updateArea: builder.mutation({
      query: (data) => ({
        url: `${AREAS_URL}/${data.areaId}`,
        method: "PUT",
        body: {
          name: data.name,
          city: data.city, // only city
        },
      }),
      invalidatesTags: ["Area"],
    }),

/* ---------------------------------------------------------------------- */

    deleteArea: builder.mutation({
      query: (areaId) => ({
        url: `${AREAS_URL}/${areaId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Area"],
    }),

/* ---------------------------------------------------------------------- */
    /*                         MOVE AREA BETWEEN CITIES                        */
    /* ---------------------------------------------------------------------- */

    assignAreaToCity: builder.mutation({
      query: ({ areaId, city }) => ({
        url: `${AREAS_URL}/${areaId}/city`,
        method: "PUT",
        body: {
          city,
        },
      }),
      invalidatesTags: ["Area"],
    }),

/* ---------------------------------------------------------------------- */
    /*                              CITY AREAS                                */
    /* ---------------------------------------------------------------------- */

    getCityAreas: builder.query({
      query: (cityId) => ({
        url: `${AREAS_URL}/city/${cityId}`,
      }),
      providesTags: ["Area"],
      keepUnusedDataFor: 5,
    }),

/* ---------------------------------------------------------------------- */

  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useCreateAreaMutation,
  useGetAreasQuery,
  useGetAreaDetailsQuery,
  useGetAreaOptionsQuery,
  useGetCompanyCitiesQuery,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
  useAssignAreaToCityMutation,
  useGetCityAreasQuery,
} = areaApiSlice;