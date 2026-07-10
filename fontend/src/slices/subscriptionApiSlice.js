import { apiSlice } from "./apiSlice";
import { SUBSCRIPTION_URL } from "../constants";

export const subscriptionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ---------------------------------------------------------------------- */
    /*                         CREATE SUBSCRIPTION                            */
    /* ---------------------------------------------------------------------- */

    createSubscription: builder.mutation({
      query: (data) => ({
        url: `${SUBSCRIPTION_URL}`,
        method: "POST",
        body: {
          company: data.company,
          plan: data.plan,
          billingCycle: data.billingCycle,
          status: data.status,
          autoRenew: data.autoRenew,
          currency: data.currency,
        },
      }),
      invalidatesTags: ["Subscription"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                          GET SUBSCRIPTION                              */
    /* ---------------------------------------------------------------------- */

    getSubscription: builder.query({
      query: (companyId) => ({
        url: `${SUBSCRIPTION_URL}/${companyId}`,
      }),
      providesTags: ["Subscription"],
      keepUnusedDataFor: 5,
    }),

    

    /* ---------------------------------------------------------------------- */
    /*                         UPDATE SUBSCRIPTION                            */
    /* ---------------------------------------------------------------------- */

    updateSubscription: builder.mutation({
  query: (data) => ({
    url: `${SUBSCRIPTION_URL}/${data.companyId}`,
    method: "PUT",
    body: {
      plan: data.plan,
      status: data.status,
      billingCycle: data.billingCycle,
      autoRenew: data.autoRenew,
      currency: data.currency,
      nextBillingDate: data.nextBillingDate,
      cancelledAt: data.cancelledAt,
    },
  }),
  invalidatesTags: ["Subscription"],
}),

  }),
});

/* -------------------------------------------------------------------------- */
/*                                EXPORT HOOKS                                */
/* -------------------------------------------------------------------------- */

export const {
  useCreateSubscriptionMutation,
  useGetSubscriptionQuery,
  useUpdateSubscriptionMutation,
} = subscriptionApiSlice;