import { apiSlice } from "./apiSlice";
import { COMPANYBILLING_URL } from "../constants";

export const companyBillingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ---------------------------------------------------------------------- */
    /*                           MY INVOICES                                  */
    /* ---------------------------------------------------------------------- */

    getMyInvoices: builder.query({
      query: () => ({
        url: `${COMPANYBILLING_URL}/invoices`,
      }),
      providesTags: ["MyInvoices"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                          CURRENT PLAN                                  */
    /* ---------------------------------------------------------------------- */

    getMyCurrentPlan: builder.query({
      query: () => ({
        url: `${COMPANYBILLING_URL}/current-plan`,
      }),
      providesTags: ["CurrentPlan"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                          CURRENT USAGE                                 */
    /* ---------------------------------------------------------------------- */

    getMyCurrentUsage: builder.query({
      query: () => ({
        url: `${COMPANYBILLING_URL}/current-usage`,
      }),
      providesTags: ["CurrentUsage"],
      keepUnusedDataFor: 5,
    }),

  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useGetMyInvoicesQuery,
  useGetMyCurrentPlanQuery,
  useGetMyCurrentUsageQuery,
} = companyBillingApiSlice;