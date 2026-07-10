import { apiSlice } from "./apiSlice";
import { BILLINGDASHBOARD_URL } from "../constants";

export const billingDashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ---------------------------------------------------------------------- */
    /*                         BILLING DASHBOARD                              */
    /* ---------------------------------------------------------------------- */

    getBillingDashboard: builder.query({
      query: () => ({
        url: `${BILLINGDASHBOARD_URL}`,
      }),
      providesTags: ["BillingDashboard"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                     COMPANY BILLING HISTORY                            */
    /* ---------------------------------------------------------------------- */

    getCompanyBillingHistory: builder.query({
      query: (companyId) => ({
        url: `${BILLINGDASHBOARD_URL}/company/${companyId}/history`,
      }),
      providesTags: (result, error, companyId) => [
        { type: "BillingHistory", id: companyId },
      ],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                         MONTHLY REVENUE                                */
    /* ---------------------------------------------------------------------- */

    getMonthlyRevenue: builder.query({
      query: () => ({
        url: `${BILLINGDASHBOARD_URL}/monthly-revenue`,
      }),
      providesTags: ["MonthlyRevenue"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                      OUTSTANDING INVOICES                              */
    /* ---------------------------------------------------------------------- */

    getOutstandingInvoices: builder.query({
      query: () => ({
        url: `${BILLINGDASHBOARD_URL}/outstanding-invoices`,
      }),
      providesTags: ["OutstandingInvoices"],
      keepUnusedDataFor: 5,
    }),

  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useGetBillingDashboardQuery,
  useGetCompanyBillingHistoryQuery,
  useGetMonthlyRevenueQuery,
  useGetOutstandingInvoicesQuery,
} = billingDashboardApiSlice;