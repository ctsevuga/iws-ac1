import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import { CUSTOMERAUTH_URL } from "../constants";

//
// Redux State Slice
//
const initialState = {
  customerInfo: localStorage.getItem("customerInfo")
    ? JSON.parse(localStorage.getItem("customerInfo"))
    : null,
};

const customerAuthSlice = createSlice({
  name: "customerAuth",

  initialState,

  reducers: {
    setCustomerCredentials: (state, action) => {
      state.customerInfo = action.payload;

      localStorage.setItem(
        "customerInfo",
        JSON.stringify(action.payload)
      );
    },

    customerLogout: (state) => {
      state.customerInfo = null;

      localStorage.removeItem("customerInfo");
    },
  },
});

export const {
  setCustomerCredentials,
  customerLogout,
} = customerAuthSlice.actions;

export default customerAuthSlice.reducer;

//
// RTK Query Endpoints
//
export const customerAuthApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // REGISTER CUSTOMER
    // =========================================================
registerCustomer: builder.mutation({
  query: ({ slug, data }) => {
    console.log("🔥 RTK MUTATION CALLED - registerCustomer");
    console.log("➡️ slug received:", slug);
    console.log("➡️ final URL:", `${CUSTOMERAUTH_URL}/${slug}/register`);

    debugger;

    return {
      url: `${CUSTOMERAUTH_URL}/${slug}/register`,
      method: "POST",
      body: data,
      credentials: "include",
    };
  },
}),

forgotCustomerPassword: builder.mutation({
  query: ({ slug, data }) => {
    console.log("🔥 RTK MUTATION CALLED - forgotCustomerPassword");
    console.log("➡️ slug received:", slug);
    console.log(
      "➡️ final URL:",
      `${CUSTOMERAUTH_URL}/${slug}/forgot-password`
    );

    debugger;

    return {
      url: `${CUSTOMERAUTH_URL}/${slug}/forgot-password`,
      method: "POST",
      body: data,
      credentials: "include",
    };
  },
}),

    // =========================================================
    // LOGIN CUSTOMER
    // =========================================================
    loginCustomer: builder.mutation({
      query: ({ slug, data }) => ({
        url: `${CUSTOMERAUTH_URL}/${slug}/login`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    // =========================================================
// LOGOUT CUSTOMER
// =========================================================
logoutCustomer: builder.mutation({
  query: () => ({
    url: `${CUSTOMERAUTH_URL}/logout`,
    method: "POST",
    credentials: "include",
  }),

  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      await queryFulfilled;

      dispatch(customerLogout());

      // Optional: clear RTK Query cache
      dispatch(apiSlice.util.resetApiState());
    } catch (err) {
      console.error("Customer logout failed:", err);
    }
  },
}),
// =========================================================
// GET CUSTOMER CITY OPTIONS (PUBLIC)
// =========================================================
getCustomerCityOptions: builder.query({
  query: (slug) => {
    

    return {
      url: `${CUSTOMERAUTH_URL}/${slug}/cities-options`,
      method: "GET",
      credentials: "include",
    };
  },
}),

// =========================================================
// GET CUSTOMER AREA OPTIONS (PUBLIC)
// =========================================================
getCustomerAreaOptions: builder.query({
  query: ({ slug, cityId }) => {
    

    return {
      url: `${CUSTOMERAUTH_URL}/${slug}/cities/${cityId}/areas-options`,
      method: "GET",
      credentials: "include",
    };
  },

  keepUnusedDataFor: 300,
}),
    // =========================================================
    // GET CUSTOMER PROFILE
    // =========================================================
    getCustomerProfile: builder.query({
      query: () => ({
        url: `${CUSTOMERAUTH_URL}/auth/profile`,
        method: "GET",
        credentials: "include",
      }),

      providesTags: ["Customer"],
      keepUnusedDataFor: 5,
    }),

    // =========================================================
    // UPDATE CUSTOMER PROFILE
    // =========================================================
    updateCustomerProfile: builder.mutation({
      query: (data) => ({
        url: `${CUSTOMERAUTH_URL}/auth/profile`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),

      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            "getCustomerProfile",
            undefined,
            (draft) => {
              Object.assign(draft, patch);

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

      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useRegisterCustomerMutation,
  useLoginCustomerMutation,
  useLogoutCustomerMutation,
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  useGetCustomerCityOptionsQuery,
  useGetCustomerAreaOptionsQuery,
  useForgotCustomerPasswordMutation,
} = customerAuthApiSlice;