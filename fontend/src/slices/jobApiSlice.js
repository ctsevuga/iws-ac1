import { apiSlice } from './apiSlice';
import { JOBS_URL } from '../constants';

export const jobApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * =========================================================
     * TECHNICIAN ACCEPTS SERVICE REQUEST
     * =========================================================
     *
     * POST /api/jobs/accept/:serviceRequestId
     *
     * System automatically:
     * - locks request
     * - assigns technician
     * - creates job
     */

    acceptServiceRequest: builder.mutation({
      query: (serviceRequestId) => ({
        url: `${JOBS_URL}/accept/${serviceRequestId}`,
        method: 'POST',
      }),

      invalidatesTags: [
        { type: 'Job', id: 'LIST' },
        { type: 'ServiceRequest', id: 'LIST' },
        { type: 'Notification', id: 'LIST' },
      ],
    }),


    /**
     * =========================================================
     * CREATE JOB (MANUAL DISPATCH FLOW)
     * =========================================================
     *
     * Allowed:
     * - admin
     * - manager
     * - dispatcher
     *
     * NOT for technicians
     */

    createJob: builder.mutation({
      query: (data) => ({
        url: `${JOBS_URL}`,
        method: 'POST',
        body: {
          serviceRequest: data.serviceRequest || null,
          customer: data.customer,
          technician: data.technician || null,
          serviceType: data.serviceType,
          scheduledAt: data.scheduledAt,
          notes: data.notes,
          location: data.location,
          estimatedCost: data.estimatedCost,
          priority: data.priority,
        },
      }),

      invalidatesTags: [
        { type: 'Job', id: 'LIST' },
        { type: 'ServiceRequest', id: 'LIST' },
      ],
    }),


    /**
     * =========================================================
     * GET JOBS
     * =========================================================
     *
     * Technicians only receive
     * their own jobs automatically
     * from backend filtering.
     */

    getJobs: builder.query({
      query: ({
        page = 1,
        limit = 20,
        status,
        technician,
        customer,
        serviceRequest,
      } = {}) => {

        let url = `${JOBS_URL}?page=${page}&limit=${limit}`;

        if (status) {
          url += `&status=${status}`;
        }

        if (technician) {
          url += `&technician=${technician}`;
        }

        if (customer) {
          url += `&customer=${customer}`;
        }

        if (serviceRequest) {
          url += `&serviceRequest=${serviceRequest}`;
        }

        return { url };
      },

      providesTags: (result) =>
        result
          ? [
              ...result.jobs.map(({ _id }) => ({
                type: 'Job',
                id: _id,
              })),
              { type: 'Job', id: 'LIST' },
            ]
          : [{ type: 'Job', id: 'LIST' }],

      keepUnusedDataFor: 5,
    }),


    /**
     * =========================================================
     * GET JOB DETAILS
     * =========================================================
     */

    getJobDetails: builder.query({
      query: (jobId) => ({
        url: `${JOBS_URL}/${jobId}`,
      }),

      providesTags: (result, error, jobId) => [
        { type: 'Job', id: jobId },
      ],

      keepUnusedDataFor: 5,
    }),

// slices/jobApiSlice.js

getJobsByCustomer: builder.query({
  query: (customerId) => ({
    url: `${JOBS_URL}/customer/${customerId}`,
  }),
}),
    /**
     * =========================================================
     * FULL JOB UPDATE
     * =========================================================
     *
     * Allowed:
     * - admin
     * - manager
     * - dispatcher
     */

    updateJob: builder.mutation({
      query: (data) => ({
        url: `${JOBS_URL}/${data.jobId}`,
        method: 'PUT',

        body: {
          serviceType: data.serviceType,
          scheduledAt: data.scheduledAt,
          technician: data.technician,
          status: data.status,
          notes: data.notes,
          location: data.location,
          estimatedCost: data.estimatedCost,
          actualCost: data.actualCost,
          priority: data.priority,
        },
      }),

      invalidatesTags: (result, error, { jobId }) => [
        { type: 'Job', id: jobId },
        { type: 'Job', id: 'LIST' },
        { type: 'ServiceRequest', id: 'LIST' },
      ],
    }),


    /**
     * =========================================================
     * DELETE JOB
     * =========================================================
     *
     * Allowed:
     * - admin
     * - manager
     */

    deleteJob: builder.mutation({
      query: (jobId) => ({
        url: `${JOBS_URL}/${jobId}`,
        method: 'DELETE',
      }),

      invalidatesTags: (result, error, jobId) => [
        { type: 'Job', id: jobId },
        { type: 'Job', id: 'LIST' },
        { type: 'ServiceRequest', id: 'LIST' },
      ],
    }),


    /**
     * =========================================================
     * QUICK STATUS UPDATE
     * =========================================================
     *
     * Workflow statuses:
     * - scheduled
     * - assigned
     * - enroute
     * - in_progress
     * - completed
     * - cancelled
     *
     * Technicians can update
     * ONLY their own jobs.
     */

    updateJobStatus: builder.mutation({
      query: ({ jobId, status }) => ({
        url: `${JOBS_URL}/${jobId}/status`,
        method: 'PATCH',
        body: { status },
      }),

      invalidatesTags: (result, error, { jobId }) => [
        { type: 'Job', id: jobId },
        { type: 'Job', id: 'LIST' },
        { type: 'ServiceRequest', id: 'LIST' },
      ],
    }),

  }),
});

export const {
  useAcceptServiceRequestMutation,
  useCreateJobMutation,
  useGetJobsQuery,
  useGetJobDetailsQuery,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useUpdateJobStatusMutation,
  useGetJobsByCustomerQuery,
} = jobApiSlice;