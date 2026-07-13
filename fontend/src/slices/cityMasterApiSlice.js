import { apiSlice } from "./apiSlice";
import { CITYMASTER_URL } from "../constants";

export const cityMasterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------------------------------------------------------------------- */
    /*                           CREATE CITY MASTER                           */
    /* ---------------------------------------------------------------------- */

    createCityMaster: builder.mutation({
      query: (data) => ({
        url: `${CITYMASTER_URL}`,
        method: "POST",
        body: {
          name: data.name,
          state: data.state,
        },
      }),
      invalidatesTags: ["CityMaster"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                          GET CITY MASTER LIST                          */
    /* ---------------------------------------------------------------------- */

    getCityMasters: builder.query({
      query: ({ page = 1, limit = 100, search } = {}) => {
        let url = `${CITYMASTER_URL}?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }

        return { url };
      },
      providesTags: ["CityMaster"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                        GET CITY MASTER DETAILS                         */
    /* ---------------------------------------------------------------------- */

    getCityMasterDetails: builder.query({
      query: (id) => ({
        url: `${CITYMASTER_URL}/${id}`,
      }),
      providesTags: ["CityMaster"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                         CITY MASTER OPTIONS                            */
    /* ---------------------------------------------------------------------- */

    getCityMasterOptions: builder.query({
      query: () => ({
        url: `${CITYMASTER_URL}/options`,
      }),
      providesTags: ["CityMaster"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                         UPDATE CITY MASTER                             */
    /* ---------------------------------------------------------------------- */

    updateCityMaster: builder.mutation({
      query: (data) => ({
        url: `${CITYMASTER_URL}/${data.cityMasterId}`,
        method: "PUT",
        body: {
          name: data.name,
          state: data.state,
        },
      }),
      invalidatesTags: ["CityMaster"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         DELETE CITY MASTER                             */
    /* ---------------------------------------------------------------------- */

    deleteCityMaster: builder.mutation({
      query: (cityMasterId) => ({
        url: `${CITYMASTER_URL}/${cityMasterId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CityMaster"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                      TOGGLE CITY MASTER STATUS                         */
    /* ---------------------------------------------------------------------- */

    toggleCityStatus: builder.mutation({
      query: (cityMasterId) => ({
        url: `${CITYMASTER_URL}/${cityMasterId}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["CityMaster"],
    }),
  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useCreateCityMasterMutation,
  useGetCityMastersQuery,
  useGetCityMasterDetailsQuery,
  useGetCityMasterOptionsQuery,
  useUpdateCityMasterMutation,
  useDeleteCityMasterMutation,
  useToggleCityStatusMutation,
} = cityMasterApiSlice;
