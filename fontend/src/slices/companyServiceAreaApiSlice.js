import { apiSlice } from "./apiSlice";
import { COMPANYSERVICEAREAS_URL } from "../constants";

export const companyServiceAreaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------------------------------------------------------------------- */
    /*                     CREATE COMPANY SERVICE AREA                         */
    /* ---------------------------------------------------------------------- */

    createCompanyServiceArea: builder.mutation({
      query: (data) => ({
        url: `${COMPANYSERVICEAREAS_URL}`,
        method: "POST",
        body: {
          company: data.company,
          city: data.city,
          area: data.area,
        },
      }),
      invalidatesTags: ["CompanyServiceArea"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                    GET COMPANY SERVICE AREA LIST                        */
    /* ---------------------------------------------------------------------- */

    getCompanyServiceAreas: builder.query({
  query: ({
    page = 1,
    limit = 100,
    search,
    company,
    city,
    area,
  } = {}) => ({
    url: COMPANYSERVICEAREAS_URL,
    params: {
      page,
      limit,
      search,
      company,
      city,
      area,
    },
  }),

  transformResponse: (response) => response.data,

  providesTags: ["CompanyServiceArea"],
  keepUnusedDataFor: 5,
}),

    /* ---------------------------------------------------------------------- */
    /*                    GET COMPANY SERVICE AREAS                            */
    /* ---------------------------------------------------------------------- */

    getCompanyAreas: builder.query({
      query: (companyId) => ({
        url: `${COMPANYSERVICEAREAS_URL}/company/${companyId}`,
      }),
      providesTags: ["CompanyServiceArea"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                    GET COMPANIES SERVING AN AREA                        */
    /* ---------------------------------------------------------------------- */

    getCompaniesByArea: builder.query({
      query: (areaId) => ({
        url: `${COMPANYSERVICEAREAS_URL}/area/${areaId}`,
      }),
      providesTags: ["CompanyServiceArea"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                   UPDATE COMPANY SERVICE AREA                           */
    /* ---------------------------------------------------------------------- */

    updateCompanyServiceArea: builder.mutation({
      query: (data) => ({
        url: `${COMPANYSERVICEAREAS_URL}/${data.companyServiceAreaId}`,
        method: "PUT",
        body: {
          company: data.company,
          city: data.city,
          area: data.area,
          isActive: data.isActive,
        },
      }),
      invalidatesTags: ["CompanyServiceArea"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                   DELETE COMPANY SERVICE AREA                           */
    /* ---------------------------------------------------------------------- */

    deleteCompanyServiceArea: builder.mutation({
      query: (companyServiceAreaId) => ({
        url: `${COMPANYSERVICEAREAS_URL}/${companyServiceAreaId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CompanyServiceArea"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                 TOGGLE COMPANY SERVICE AREA STATUS                      */
    /* ---------------------------------------------------------------------- */

    toggleCompanyServiceAreaStatus: builder.mutation({
      query: (companyServiceAreaId) => ({
        url: `${COMPANYSERVICEAREAS_URL}/${companyServiceAreaId}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["CompanyServiceArea"],
    }),
  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useCreateCompanyServiceAreaMutation,
  useGetCompanyServiceAreasQuery,
  useGetCompanyAreasQuery,
  useGetCompaniesByAreaQuery,
  useUpdateCompanyServiceAreaMutation,
  useDeleteCompanyServiceAreaMutation,
  useToggleCompanyServiceAreaStatusMutation,
} = companyServiceAreaApiSlice;
