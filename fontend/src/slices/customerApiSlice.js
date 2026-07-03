import { apiSlice } from './apiSlice';
import { CUSTOMERS_URL } from '../constants';

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * Create Customer
     * Access: manager, dispatcher
     */
    createCustomer: builder.mutation({
      query: (data) => ({
        url: `${CUSTOMERS_URL}`,
        method: 'POST',
        body: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          notes: data.notes,
          area: data.area,
        },
      }),
      invalidatesTags: ['Customer'],
    }),

    /**
     * Get all customers
     * Access: manager, dispatcher, technician
     */
    getCustomers: builder.query({
      query: ({
        page = 1,
        limit = 20,
        search,
        area,
        isActive,
      } = {}) => {
        let url = `${CUSTOMERS_URL}?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }

        // Area filter
        if (area) {
          url += `&area=${area}`;
        }

        // Active / inactive filter
        if (isActive !== undefined) {
          url += `&isActive=${isActive}`;
        }

        return { url };
      },

      providesTags: ['Customer'],
      keepUnusedDataFor: 5,
    }),

    /**
     * Get customer by ID
     * Access: manager, dispatcher, technician
     */
    getCustomerDetails: builder.query({
      query: (id) => ({
        url: `${CUSTOMERS_URL}/${id}`,
      }),

      providesTags: ['Customer'],
      keepUnusedDataFor: 5,
    }),

    /**
     * Update customer
     * Access: manager, dispatcher
     */
    updateCustomer: builder.mutation({
      query: (data) => ({
        url: `${CUSTOMERS_URL}/${data.customerId}`,
        method: 'PUT',

        body: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          notes: data.notes,
          area: data.area,

          // Only manager should send this
          isActive: data.isActive,
        },
      }),

      invalidatesTags: ['Customer'],
    }),

    /**
     * Soft delete customer
     * Access: manager only
     */
    deleteCustomer: builder.mutation({
      query: (customerId) => ({
        url: `${CUSTOMERS_URL}/${customerId}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['Customer'],
    }),

    /**
     * Reactivate customer
     * Access: manager only
     */
    reactivateCustomer: builder.mutation({
      query: (customerId) => ({
        url: `${CUSTOMERS_URL}/${customerId}/reactivate`,
        method: 'PUT',
      }),

      invalidatesTags: ['Customer'],
    }),

  }),
});

export const {
  useCreateCustomerMutation,

  useGetCustomersQuery,
  useGetCustomerDetailsQuery,

  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useReactivateCustomerMutation,
} = customerApiSlice;