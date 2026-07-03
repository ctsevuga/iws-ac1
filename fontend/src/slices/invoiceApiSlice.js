import { apiSlice } from "./apiSlice";
import { INVOICES_URL } from "../constants";

export const invoiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * =========================================================
     * Create Invoice
     * =========================================================
     *
     * Backend auto-calculates:
     * - subtotal
     * - taxAmount
     * - totalAmount
     * - line totals
     * - invoiceNumber
     *
     * Required:
     * - job
     * - customer
     * - items
     * - dueDate
     *
     * Optional:
     * - paymentMethod
     * - taxRate
     * - discount
     * - notes
     * - currency
     */
    createInvoice: builder.mutation({
      query: (data) => ({
        url: `${INVOICES_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Invoice"],
    }),

    /**
     * =========================================================
     * Get All Invoices
     * =========================================================
     *
     * Supports:
     * - pagination
     * - status filtering
     * - customer filtering
     * - invoice number search
     */
    getInvoices: builder.query({
      query: ({
        page = 1,
        limit = 20,
        status,
        customer,
        search,
      } = {}) => {
        let url = `${INVOICES_URL}?page=${page}&limit=${limit}`;

        if (status) {
          url += `&status=${status}`;
        }

        if (customer) {
          url += `&customer=${customer}`;
        }

        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        return { url };
      },

      providesTags: ["Invoice"],

      keepUnusedDataFor: 5,
    }),

    /**
     * =========================================================
     * Get Invoice Details
     * =========================================================
     */
    getInvoiceDetails: builder.query({
      query: (invoiceId) => ({
        url: `${INVOICES_URL}/${invoiceId}`,
      }),

      providesTags: (result, error, invoiceId) => [
        { type: "Invoice", id: invoiceId },
      ],

      keepUnusedDataFor: 5,
    }),

    /**
     * =========================================================
     * Update Invoice
     * =========================================================
     *
     * PATCH because backend supports partial updates
     *
     * Backend recalculates:
     * - subtotal
     * - taxAmount
     * - totalAmount
     */
    updateInvoice: builder.mutation({
      query: ({ invoiceId, ...data }) => ({
        url: `${INVOICES_URL}/${invoiceId}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (result, error, arg) => [
        "Invoice",
        { type: "Invoice", id: arg.invoiceId },
      ],
    }),

    /**
     * =========================================================
     * Delete Invoice
     * =========================================================
     */
    deleteInvoice: builder.mutation({
      query: (invoiceId) => ({
        url: `${INVOICES_URL}/${invoiceId}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Invoice"],
    }),

    /**
     * =========================================================
     * Update Invoice Status
     * =========================================================
     *
     * Supported statuses:
     * - draft
     * - sent
     * - paid
     * - overdue
     * - cancelled
     */
    updateInvoiceStatus: builder.mutation({
      query: ({ invoiceId, status }) => ({
        url: `${INVOICES_URL}/${invoiceId}/status`,
        method: "PATCH",
        body: { status },
      }),

      invalidatesTags: (result, error, arg) => [
        "Invoice",
        { type: "Invoice", id: arg.invoiceId },
      ],
    }),

  }),
});

export const {
  useCreateInvoiceMutation,

  useGetInvoicesQuery,
  useGetInvoiceDetailsQuery,

  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,

  useUpdateInvoiceStatusMutation,
} = invoiceApiSlice;