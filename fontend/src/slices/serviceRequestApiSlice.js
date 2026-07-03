import { apiSlice } from "./apiSlice";

import { SERVICEREQUESTS_URL } from "../constants";

export const serviceRequestApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({

      /**
       * =====================================================
       * CREATE SERVICE REQUEST
       * =====================================================
       */

      createStaffServiceRequest:
        builder.mutation({
          query: (data) => ({
            url: `${SERVICEREQUESTS_URL}`,

            method: "POST",

            body: {
              customer: data.customer,

              title: data.title,

              issueType: data.issueType,

              requiredSkills:
                data.requiredSkills || [],

              description:
                data.description,

              priority:
                data.priority,

              source: data.source,

              preferredDate:
                data.preferredDate,

              preferredTimeSlot:
                data.preferredTimeSlot,

              serviceAddress:
                data.serviceAddress,

              attachments:
                data.attachments || [],

              customerNotes:
                data.customerNotes || "",
            },
          }),

          invalidatesTags: [
            "ServiceRequest",
          ],
        }),

      /**
       * =====================================================
       * GET ALL SERVICE REQUESTS
       * =====================================================
       */

      getServiceRequests:
        builder.query({
          query: ({
            page = 1,

            limit = 20,

            status,

            priority,

            customer,

            area,

            issueType,

            assignedTechnician,

            search,
          } = {}) => {
            let url = `${SERVICEREQUESTS_URL}?page=${page}&limit=${limit}`;

            if (status) {
              url += `&status=${status}`;
            }

            if (priority) {
              url += `&priority=${priority}`;
            }

            if (customer) {
              url += `&customer=${customer}`;
            }

            if (area) {
              url += `&area=${area}`;
            }

            if (issueType) {
              url += `&issueType=${issueType}`;
            }

            if (
              assignedTechnician
            ) {
              url += `&assignedTechnician=${assignedTechnician}`;
            }

            if (search) {
              url += `&search=${search}`;
            }

            return { url };
          },

          providesTags: [
            "ServiceRequest",
          ],

          keepUnusedDataFor: 5,
        }),

      /**
       * =====================================================
       * GET SERVICE REQUEST DETAILS
       * =====================================================
       */

      getServiceRequestDetails:
        builder.query({
          query: (id) => ({
            url: `${SERVICEREQUESTS_URL}/${id}`,
          }),

          providesTags: [
            "ServiceRequest",
          ],

          keepUnusedDataFor: 5,
        }),

        getServiceRequestAcceptPreview:
  builder.query({
    query: (id) => ({
      url: `${SERVICEREQUESTS_URL}/${id}/accept-preview`,
    }),

    keepUnusedDataFor: 5,
  }),

      /**
       * =====================================================
       * UPDATE SERVICE REQUEST
       * =====================================================
       */

      updateServiceRequest:
        builder.mutation({
          query: (data) => ({
            url: `${SERVICEREQUESTS_URL}/${data.serviceRequestId}`,

            method: "PUT",

            body: {
              title: data.title,

              issueType:
                data.issueType,

              requiredSkills:
                data.requiredSkills,

              description:
                data.description,

              priority:
                data.priority,

              status:
                data.status,

              source:
                data.source,

              preferredDate:
                data.preferredDate,

              preferredTimeSlot:
                data.preferredTimeSlot,

              serviceAddress:
                data.serviceAddress,

              customerNotes:
                data.customerNotes,

              internalNotes:
                data.internalNotes,

              attachments:
                data.attachments,
            },
          }),

          invalidatesTags: [
            "ServiceRequest",
          ],
        }),

      /**
       * =====================================================
       * ASSIGN TECHNICIAN
       * =====================================================
       */

      assignTechnician:
        builder.mutation({
          query: ({
            serviceRequestId,
            technicianId,
          }) => ({
            url: `${SERVICEREQUESTS_URL}/${serviceRequestId}/assign-technician`,

            method: "PATCH",

            body: {
              technicianId,
            },
          }),

          invalidatesTags: [
            "ServiceRequest",
          ],
        }),

      /**
       * =====================================================
       * ADD MESSAGE TO REQUEST
       * =====================================================
       */

      addServiceRequestMessage:
        builder.mutation({
          query: ({
            serviceRequestId,
            message,
          }) => ({
            url: `${SERVICEREQUESTS_URL}/${serviceRequestId}/messages`,

            method: "POST",

            body: {
              message,
            },
          }),

          invalidatesTags: [
            "ServiceRequest",
          ],
        }),

      /**
       * =====================================================
       * CONVERT SERVICE REQUEST -> JOB
       * =====================================================
       */

      convertServiceRequest:
        builder.mutation({
          query: (
            serviceRequestId
          ) => ({
            url: `${SERVICEREQUESTS_URL}/${serviceRequestId}/convert`,

            method: "PATCH",
          }),

          invalidatesTags: [
            "ServiceRequest",
          ],
        }),

      /**
       * =====================================================
       * CLOSE SERVICE REQUEST
       * =====================================================
       */

      closeServiceRequest:
        builder.mutation({
          query: (
            serviceRequestId
          ) => ({
            url: `${SERVICEREQUESTS_URL}/${serviceRequestId}/close`,

            method: "PATCH",
          }),

          invalidatesTags: [
            "ServiceRequest",
          ],
        }),

      /**
       * =====================================================
       * DELETE SERVICE REQUEST
       * =====================================================
       */

      deleteServiceRequest:
        builder.mutation({
          query: (
            serviceRequestId
          ) => ({
            url: `${SERVICEREQUESTS_URL}/${serviceRequestId}`,

            method: "DELETE",
          }),

          invalidatesTags: [
            "ServiceRequest",
          ],
        }),

    }),
  });

export const {
  useCreateStaffServiceRequestMutation,

  useGetServiceRequestAcceptPreviewQuery,

  useGetServiceRequestsQuery,

  useGetServiceRequestDetailsQuery,

  useUpdateServiceRequestMutation,

  useAssignTechnicianMutation,

  useAddServiceRequestMessageMutation,

  useConvertServiceRequestMutation,

  useCloseServiceRequestMutation,

  useDeleteServiceRequestMutation,
} = serviceRequestApiSlice;