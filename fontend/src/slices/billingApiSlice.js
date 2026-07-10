import { apiSlice } from "./apiSlice";
import { BILLING_URL } from "../constants";

export const billingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------------------------------------------------------------------- */
    /*                         GENERATE INVOICE                               */
    /* ---------------------------------------------------------------------- */

  generateInvoice: builder.mutation({
  query: (data) => ({
    url: `${BILLING_URL}/invoices/generate`,
    method: "POST",
    body: data,
  }),
}),

    /* ---------------------------------------------------------------------- */
    /*                       REGENERATE INVOICE                               */
    /* ---------------------------------------------------------------------- */

    reGenerateInvoice: builder.mutation({
      query: (invoiceId) => ({
        url: `${BILLING_URL}/invoices/${invoiceId}/regenerate`,
        method: "PUT",
      }),
      invalidatesTags: ["Invoice"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         MARK INVOICE PAID                              */
    /* ---------------------------------------------------------------------- */

    markInvoicePaid: builder.mutation({
      query: (invoiceId) => ({
        url: `${BILLING_URL}/invoices/${invoiceId}/pay`,
        method: "PUT",
      }),
      invalidatesTags: ["Invoice"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         CANCEL INVOICE                                 */
    /* ---------------------------------------------------------------------- */

    cancelInvoice: builder.mutation({
      query: (invoiceId) => ({
        url: `${BILLING_URL}/invoices/${invoiceId}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["Invoice"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         GET SINGLE INVOICE                             */
    /* ---------------------------------------------------------------------- */

    getInvoice: builder.query({
      query: (invoiceId) => ({
        url: `${BILLING_URL}/invoices/${invoiceId}`,
      }),
      providesTags: ["Invoice"],
      keepUnusedDataFor: 5,
    }),

    /* ---------------------------------------------------------------------- */
    /*                         LIST INVOICES                                  */
    /* ---------------------------------------------------------------------- */

    listInvoices: builder.query({
      query: ({ page = 1, limit = 20, status, company } = {}) => {
        let url = `${BILLING_URL}/invoices?page=${page}&limit=${limit}`;

        if (status) {
          url += `&status=${status}`;
        }

        if (company) {
          url += `&company=${company}`;
        }

        return {
          url,
        };
      },

      providesTags: ["Invoice"],

      keepUnusedDataFor: 5,
    }),
  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useGenerateInvoiceMutation,

  useReGenerateInvoiceMutation,

  useMarkInvoicePaidMutation,

  useCancelInvoiceMutation,

  useGetInvoiceQuery,

  useListInvoicesQuery,
} = billingApiSlice;
