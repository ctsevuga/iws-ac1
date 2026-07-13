
import { apiSlice } from "./apiSlice";
import { AREAMASTER_URL } from "../constants";

export const areaMasterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ---------------------------------------------------------------------- */
    /*                           CREATE AREA MASTER                           */
    /* ---------------------------------------------------------------------- */

    createAreaMaster: builder.mutation({
      query: (data) => ({
        url: `${AREAMASTER_URL}`,
        method: "POST",
        body: {
          name: data.name,
          city: data.city,
        },
      }),
      invalidatesTags: ["AreaMaster"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         GET AREA MASTER LIST                           */
    /* ---------------------------------------------------------------------- */

    getAreaMasters: builder.query({
      query: ({ page = 1, limit = 100, search } = {}) => {
        let url = `${AREAMASTER_URL}?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }

        return { url };
      },
      providesTags: ["AreaMaster"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                      GET AREA MASTER DETAILS                           */
    /* ---------------------------------------------------------------------- */

    getAreaMasterDetails: builder.query({
      query: (id) => ({
        url: `${AREAMASTER_URL}/${id}`,
      }),
      providesTags: ["AreaMaster"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                         AREA MASTER OPTIONS                            */
    /* ---------------------------------------------------------------------- */

    getAreaMasterOptions: builder.query({
      query: () => ({
        url: `${AREAMASTER_URL}/options`,
      }),
      providesTags: ["AreaMaster"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                          AREAS BY CITY                                 */
    /* ---------------------------------------------------------------------- */

    getCityAreaMasters: builder.query({
      query: (cityId) => ({
        url: `${AREAMASTER_URL}/city/${cityId}`,
      }),
      providesTags: ["AreaMaster"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                         UPDATE AREA MASTER                             */
    /* ---------------------------------------------------------------------- */

    updateAreaMaster: builder.mutation({
      query: (data) => ({
        url: `${AREAMASTER_URL}/${data.areaMasterId}`,
        method: "PUT",
        body: {
          name: data.name,
          city: data.city,
        },
      }),
      invalidatesTags: ["AreaMaster"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         DELETE AREA MASTER                             */
    /* ---------------------------------------------------------------------- */

    deleteAreaMaster: builder.mutation({
      query: (areaMasterId) => ({
        url: `${AREAMASTER_URL}/${areaMasterId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AreaMaster"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                      TOGGLE AREA MASTER STATUS                         */
    /* ---------------------------------------------------------------------- */

    toggleAreaMasterStatus: builder.mutation({
      query: (areaMasterId) => ({
        url: `${AREAMASTER_URL}/${areaMasterId}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["AreaMaster"],
    }),

  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useCreateAreaMasterMutation,
  useGetAreaMastersQuery,
  useGetAreaMasterDetailsQuery,
  useGetAreaMasterOptionsQuery,
  useGetCityAreaMastersQuery,
  useUpdateAreaMasterMutation,
  useDeleteAreaMasterMutation,
  useToggleAreaMasterStatusMutation,
} = areaMasterApiSlice;

