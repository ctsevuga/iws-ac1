import { apiSlice } from "./apiSlice";
import { ITEMS_URL } from "../constants";

export const itemApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * =========================================================
     * Create Item
     * =========================================================
     */
    createItem: builder.mutation({
      query: (data) => ({
        url: `${ITEMS_URL}`,
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Item"],
    }),

    /**
     * =========================================================
     * Get All Items
     * =========================================================
     *
     * Supports:
     * - pagination
     * - search
     * - include inactive items
     */
    getItems: builder.query({
      query: ({ page = 1, limit = 20, search, includeInactive } = {}) => {
        let url = `${ITEMS_URL}?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        if (includeInactive) {
          url += `&includeInactive=true`;
        }

        return { url };
      },

      providesTags: ["Item"],

      keepUnusedDataFor: 5,
    }),

    /**
     * =========================================================
     * Get Item Details
     * =========================================================
     */
    getItemDetails: builder.query({
      query: (itemId) => ({
        url: `${ITEMS_URL}/${itemId}`,
      }),

      providesTags: (result, error, itemId) => [
        { type: "Item", id: itemId },
      ],

      keepUnusedDataFor: 5,
    }),

    /**
     * =========================================================
     * Update Item
     * =========================================================
     */
    updateItem: builder.mutation({
      query: ({ itemId, ...data }) => ({
        url: `${ITEMS_URL}/${itemId}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (result, error, arg) => [
        "Item",
        { type: "Item", id: arg.itemId },
      ],
    }),

    /**
     * =========================================================
     * Delete Item
     * =========================================================
     */
    deleteItem: builder.mutation({
      query: (itemId) => ({
        url: `${ITEMS_URL}/${itemId}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Item"],
    }),

  }),
});

export const {
  useCreateItemMutation,

  useGetItemsQuery,
  useGetItemDetailsQuery,

  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemApiSlice;