import { apiSlice } from "./apiSlice";
import { CITIES_URL } from "../constants";

export const cityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ---------------------------------------------------------------------- */
    /*                              CITY CRUD                                 */
    /* ---------------------------------------------------------------------- */

    createCity: builder.mutation({
      query: (data) => ({
        url: `${CITIES_URL}`,
        method: "POST",
        body: {
          name: data.name,
          state: data.state,
          country: data.country, // optional (defaults to India in backend)
        },
      }),
      invalidatesTags: ["City"],
    }),

/* ---------------------------------------------------------------------- */

    getCities: builder.query({
      query: ({ page = 1, limit = 20, search } = {}) => {
        let url = `${CITIES_URL}?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }

        return { url };
      },
      providesTags: ["City"],
      keepUnusedDataFor: 5,
    }),

/* ---------------------------------------------------------------------- */

    getCityDetails: builder.query({
      query: (id) => ({
        url: `${CITIES_URL}/${id}`,
      }),
      providesTags: ["City"],
      keepUnusedDataFor: 5,
    }),

/* ---------------------------------------------------------------------- */

    updateCity: builder.mutation({
      query: (data) => ({
        url: `${CITIES_URL}/${data.cityId}`,
        method: "PUT",
        body: {
          name: data.name,
          state: data.state,
          country: data.country,
        },
      }),
      invalidatesTags: ["City"],
    }),

/* ---------------------------------------------------------------------- */

    deleteCity: builder.mutation({
      query: (cityId) => ({
        url: `${CITIES_URL}/${cityId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["City"],
    }),

/* ---------------------------------------------------------------------- */

    getCityOptions: builder.query({
      query: () => ({
        url: `${CITIES_URL}/options`,
      }),
      providesTags: ["City"],
      keepUnusedDataFor: 5,
    }),

/* ---------------------------------------------------------------------- */
    /*                         CITY → AREAS RELATIONSHIP                      */
    /* ---------------------------------------------------------------------- */

    // getCityAreas: builder.query({
    //   query: (cityId) => ({
    //     url: `${CITIES_URL}/${cityId}/areas`,
    //   }),
    //   providesTags: ["City", "Area"],
    //   keepUnusedDataFor: 5,
    // }),

/* ---------------------------------------------------------------------- */

  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useCreateCityMutation,
  useGetCitiesQuery,
  useGetCityDetailsQuery,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetCityOptionsQuery,
  // useGetCityAreasQuery,
} = cityApiSlice;