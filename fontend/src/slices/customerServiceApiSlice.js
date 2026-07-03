import { apiSlice } from "./apiSlice";
import { CUSTOMERSERVICE_URL } from "../constants";

/**
 * =========================================================
 * CUSTOMER PORTAL API SLICE
 * =========================================================
 *
 * Covers:
 * - Auth (register/login/logout/profile)
 * - Service Requests (create, list, detail, cancel)
 *
 * Works with:
 * - tenantResolver (domain-based company)
 * - protectCustomer (JWT cookie auth)
 */
export const customerServiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * =========================================================
     * REGISTER CUSTOMER
     * =========================================================
     */
    registerCustomer: builder.mutation({
      query: (data) => ({
        url: `${CUSTOMERSERVICE_URL}/auth/register`,
        method: "POST",
        body: data,
      }),
    }),

    /**
     * =========================================================
     * LOGIN CUSTOMER (PHONE + PASSWORD)
     * =========================================================
     */
    loginCustomer: builder.mutation({
      query: (data) => ({
        url: `${CUSTOMERSERVICE_URL}/auth/login`,
        method: "POST",
        body: data,
      }),
    }),

    /**
     * =========================================================
     * LOGOUT CUSTOMER
     * =========================================================
     */
    logoutCustomer: builder.mutation({
      query: () => ({
        url: `${CUSTOMERSERVICE_URL}/auth/logout`,
        method: "POST",
      }),
    }),

    /**
     * =========================================================
     * GET CUSTOMER PROFILE
     * =========================================================
     */
    getCustomerProfile: builder.query({
      query: () => ({
        url: `${CUSTOMERSERVICE_URL}/auth/profile`,
      }),
      providesTags: ["Customer"],
    }),

    /**
     * =========================================================
     * UPDATE CUSTOMER PROFILE
     * =========================================================
     */
    updateCustomerProfile: builder.mutation({
      query: (data) => ({
        url: `${CUSTOMERSERVICE_URL}/auth/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Customer"],
    }),

    /**
     * =========================================================
     * CREATE SERVICE REQUEST
     * =========================================================
     */
    createServiceRequest: builder.mutation({
  query: ({ companySlug, data }) => ({
    url: `${CUSTOMERSERVICE_URL}/${companySlug}/service-requests`,
    method: "POST",
    body: data,
  }),
  invalidatesTags: ["ServiceRequest"],
}),

    /**
     * =========================================================
     * GET MY SERVICE REQUESTS
     * =========================================================
     */
    getMyServiceRequests: builder.query({
  query: (companySlug) => ({
    url: `${CUSTOMERSERVICE_URL}/${companySlug}/service-requests`,
    method: "GET",
  }),
  providesTags: ["ServiceRequest"],
  keepUnusedDataFor: 5,
  skip: (companySlug) => !companySlug,
}),

    /**
     * =========================================================
     * GET SINGLE SERVICE REQUEST
     * =========================================================
     */
    getMyServiceRequestDetails: builder.query({
  query: ({ companySlug, requestId }) => ({
    url: `${CUSTOMERSERVICE_URL}/${companySlug}/service-requests/${requestId}`,
    method: "GET",
  }),
  providesTags: (result, error, { requestId }) => [
    { type: "ServiceRequest", id: requestId },
  ],
  keepUnusedDataFor: 5,
}),

    /**
     * =========================================================
     * CANCEL SERVICE REQUEST (if implemented backend)
     * =========================================================
     */
    cancelServiceRequest: builder.mutation({
      query: (requestId) => ({
        url: `${CUSTOMERSERVICE_URL}/service-requests/${requestId}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["ServiceRequest"],
    }),

  }),
});

/**
 * =========================================================
 * EXPORT HOOKS
 * =========================================================
 */
export const {
  useRegisterCustomerMutation,
  useLoginCustomerMutation,
  useLogoutCustomerMutation,

  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,

  useCreateServiceRequestMutation,
  useGetMyServiceRequestsQuery,
  useGetMyServiceRequestDetailsQuery,
  useCancelServiceRequestMutation,
} = customerServiceApiSlice;