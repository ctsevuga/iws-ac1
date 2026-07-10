import { apiSlice } from "./apiSlice";
import { COMPANIES_URL } from "../constants";

export const companyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * =========================================================
     * CREATE COMPANY
     * =========================================================
     */
    createCompany: builder.mutation({
  query: (data) => ({
    url: COMPANIES_URL,
    method: "POST",
    body: data,
  }),

  // invalidate company list after creation
  invalidatesTags: ["Company"],
}),

    /**
     * =========================================================
     * GET MY COMPANY
     * =========================================================
     */
    getMyCompany: builder.query({
  query: () => ({
    url: `${COMPANIES_URL}/me`,
    method: "GET",
    credentials: "include", // important for SaaS auth cookies
  }),

  transformResponse: (response) => response.data,

  providesTags: ["Company"],
  keepUnusedDataFor: 5,
}),

    /**
     * =========================================================
     * MANAGER UPDATE OWN COMPANY
     * =========================================================
     * PUT /api/companies/me
     * Supports:
     * - basic fields
     * - branding
     * - settings
     * - portalSettings
     * =========================================================
     */
    updateMyCompany: builder.mutation({
  query: (data) => ({
    url: `${COMPANIES_URL}/me`,
    method: "PUT",
    body: data,
  }),

  async onQueryStarted(patch, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      apiSlice.util.updateQueryData(
        "getMyCompany",
        undefined,
        (draft) => {
          // =========================
          // SAFE TOP-LEVEL MERGE
          // =========================
          Object.assign(draft, patch);

          // =========================
          // SAFE NESTED MERGES
          // =========================

          if (patch.brand) {
            draft.brand = {
              ...draft.brand,
              ...patch.brand,
            };
          }

          if (patch.settings) {
            draft.settings = {
              ...draft.settings,
              ...patch.settings,
            };
          }

          if (patch.address) {
            draft.address = {
              ...draft.address,
              ...patch.address,
            };
          }
        }
      )
    );

    try {
      await queryFulfilled;
    } catch {
      patchResult.undo();
    }
  },

  invalidatesTags: ["Company"],
}),

    /**
     * =========================================================
     * ADMIN UPDATE COMPANY
     * =========================================================
     * PUT /api/companies/:id
     * Full control:
     * - branding
     * - settings
     * - portalSettings
     * =========================================================
     */
    updateCompany: builder.mutation({
  query: ({ companyId, ...data }) => ({
    url: `${COMPANIES_URL}/${companyId}`,
    method: "PUT",
    body: data,
  }),

  async onQueryStarted(
    { companyId, ...patch },
    { dispatch, queryFulfilled }
  ) {
    const patchResult = dispatch(
      apiSlice.util.updateQueryData(
        "getCompanyDetails",
        companyId,
        (draft) => {
          // =========================
          // BASIC SHALLOW MERGE
          // =========================
          Object.assign(draft, patch);

          // =========================
          // BRAND (FIXED)
          // =========================
          if (patch.brand) {
            if (!draft.brand) draft.brand = {};
            Object.assign(draft.brand, patch.brand);
          }

          // =========================
          // SETTINGS (SAFE MERGE)
          // =========================
          if (patch.settings) {
            if (!draft.settings) draft.settings = {};
            Object.assign(draft.settings, patch.settings);
          }
        }
      )
    );

    try {
      await queryFulfilled;
    } catch {
      patchResult.undo();
    }
  },

  invalidatesTags: ["Company"],
}),

    /**
     * =========================================================
     * GET ALL COMPANIES
     * =========================================================
     */
    getCompanies: builder.query({
  query: ({ page = 1, limit = 20 } = {}) => ({
    url: `${COMPANIES_URL}?page=${page}&limit=${limit}`,
  }),

  // =========================
  // Cache tagging (important for list invalidation)
  // =========================
  providesTags: (result) =>
    result?.companies
      ? [
          ...result.companies.map(({ _id }) => ({
            type: "Company",
            id: _id,
          })),
          { type: "Company", id: "LIST" },
        ]
      : [{ type: "Company", id: "LIST" }],

  // =========================
  // Cache behavior
  // =========================
  keepUnusedDataFor: 5,
}),
searchCompanies: builder.query({
  query: ({ search = "", page = 1, limit = 20 }) => ({
    url: COMPANIES_URL,
    params: {
      page,
      limit,
      search,
    },
  }),

  keepUnusedDataFor: 5,
}),
    /**
     * =========================================================
     * GET COMPANY DETAILS
     * =========================================================
     */
    getCompanyDetails: builder.query({
  query: (id) => ({
    url: `${COMPANIES_URL}/${id}`,
  }),

  // =========================
  // Better cache tagging (per company)
  // =========================
  providesTags: (result, error, id) => [
    { type: "Company", id },
  ],

  // =========================
  // Cache retention
  // =========================
  keepUnusedDataFor: 5,
}),

    /**
     * =========================================================
     * DELETE COMPANY (SOFT DELETE)
     * =========================================================
     */
    deleteCompany: builder.mutation({
      query: (companyId) => ({
        url: `${COMPANIES_URL}/${companyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Company"],
    }),

  }),
});

export const {
  useCreateCompanyMutation,
  useGetMyCompanyQuery,
  useUpdateMyCompanyMutation,
  useUpdateCompanyMutation,
  useGetCompaniesQuery,
  useLazySearchCompaniesQuery,
  useGetCompanyDetailsQuery,
  useDeleteCompanyMutation,
} = companyApiSlice;