import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * ======================================
     * AUTH
     * ======================================
     */

    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),

    /**
     * ======================================
     * REGISTRATION (PUBLIC)
     * ======================================
     */

    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
createUser: builder.mutation({
  query: (data) => ({
    url: `${USERS_URL}/create`,
    method: "POST",
    body: data,
  }),
  invalidatesTags: ["User"],
}),
    /**
     * ======================================
     * PASSWORD MANAGEMENT
     * ======================================
     */
  changePassword: builder.mutation({
  query: (data) => ({
    url: `${USERS_URL}/change-password`,
    method: "PUT",
    body: data,
  }),
}),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    /**
     * ======================================
     * PROFILE (SELF SERVICE)
     * ======================================
     */

    getProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),
    getTechnicianUserOptions: builder.query({
  query: () => ({
    url: `${USERS_URL}/technician-options`,
  }),

  providesTags: ["User"],

  keepUnusedDataFor: 5,
}),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    /**
     * ======================================
     * COMPANY USERS (MANAGER SCOPED)
     * ======================================
     */

    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    /**
     * ======================================
     * UPDATE / DELETE USERS
     * ======================================
     */

    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

/**
     * ======================================
     * ROLE ASSIGNMENT (NEW)
     * ======================================
     *
     * Manager assigns role AFTER registration
     */

    assignUserRole: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/assign-role`,
        method: "PUT",
        body: data, // { userId, role }
      }),
      invalidatesTags: ["User"],
    }),

  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useCreateUserMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,

  useGetProfileQuery,
  useUpdateProfileMutation,

  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,

  // ✅ NEW EXPORT
  useAssignUserRoleMutation,
  useGetTechnicianUserOptionsQuery,
} = userApiSlice;