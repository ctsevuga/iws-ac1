import asyncHandler from "../middleware/asyncHandler.js";
import Company from "../models/companyModel.js";
import ServiceRequest from "../models/serviceRequestModel.js";
import Technician from "../models/technicianModel.js";
import Notification from "../models/notificationModel.js";
import Area from "../models/areaModel.js";

import { logActivity } from "../utils/activityLogger.js";

/**
 * =====================================================
 * CREATE SERVICE REQUEST (CUSTOMER PORTAL)
 * POST /portal/service-requests
 * =====================================================
 */
const createCustomerServiceRequest = asyncHandler(async (req, res) => {
  const customer = req.customer;
  const companySlug = req.params.companySlug;

  /**
   * =====================================================
   * VALIDATE COMPANY
   * =====================================================
   */
  const company = await Company.findOne({
    slug: companySlug,
    isActive: true,
  });

  if (!company) {
    res.status(400);
    throw new Error("Invalid company");
  }

  const companyId = company._id;

  const {
    issueType,
    description,
    priority,
    preferredDate,
  } = req.body;

  /**
   * =====================================================
   * VALIDATE CUSTOMER AREA
   * =====================================================
   */
  if (!customer.area) {
    res.status(400);
    throw new Error("Customer is not assigned to any service area");
  }

  /**
   * =====================================================
   * RESOLVE AREA + CITY
   * =====================================================
   */
  const areaDoc = await Area.findOne({
    _id: customer.area,
    company: companyId,
  }).populate("city");

  if (!areaDoc) {
    res.status(400);
    throw new Error("Invalid service area");
  }

  if (!areaDoc.city) {
    res.status(400);
    throw new Error("Service area is not mapped to any city");
  }

  const areaId = areaDoc._id;
  const cityId = areaDoc.city._id || areaDoc.city;

  /**
   * =====================================================
   * CREATE SERVICE REQUEST
   * =====================================================
   */
  const request = await ServiceRequest.create({
    company: companyId,
    customer: customer._id,

    area: areaId,
    city: cityId,

    title: `${issueType} - Service Request`,
    issueType,
    description,
    priority: priority || "medium",
    preferredDate,

    source: "WEB",

    customerSnapshot: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,

      address: {
        street: customer.address?.street || "",
        city: customer.address?.city || "",
        state: customer.address?.state || "",
        pincode: customer.address?.pincode || "",
        country: customer.address?.country || "India",
        landmark: customer.address?.landmark || "",
        location: customer.address?.location,
      },
    },
  });

  /**
   * =====================================================
   * FIND AVAILABLE TECHNICIANS
   * =====================================================
   * Technicians are assigned to Areas.
   * Therefore Area remains the routing key.
   * =====================================================
   */
  const technicians = await Technician.find({
    company: companyId,
    areas: areaId,
    isAvailable: true,
  });

  /**
   * =====================================================
   * CREATE NOTIFICATIONS
   * =====================================================
   */
  if (technicians.length > 0) {
    const notifications = technicians.map((tech) => ({
      company: companyId,
      area: areaId,

      recipientType: "Technician",
      recipient: tech._id,

      serviceRequest: request._id,

      title: "New Service Request",
      message: `New ${issueType} request in your service area`,

      channel: "IN_APP",
      status: "pending",

      metadata: {
        priority: request.priority,
        customerName: customer.name,
        city: cityId,
        area: areaId,
      },
    }));

    await Notification.insertMany(notifications);
  }

  /**
   * =====================================================
   * ACTIVITY LOG
   * =====================================================
   */
  await logActivity({
    company: companyId,
    entityType: "ServiceRequest",
    entityId: request._id,
    action: "CUSTOMER_CREATE_SERVICE_REQUEST",
    message: `Customer ${customer.name} created a service request`,
  });

  /**
   * =====================================================
   * RESPONSE
   * =====================================================
   */
  res.status(201).json(request);
});

/**
 * =====================================================
 * GET ALL MY SERVICE REQUESTS
 * GET /portal/service-requests
 * =====================================================
 */
const getMyServiceRequests = asyncHandler(async (req, res) => {
  const { companySlug } = req.params;

  const company = await Company.findOne({
    slug: companySlug,
    isActive: true,
  });

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  const requests = await ServiceRequest.find({
    company: company._id,
    customer: req.customer._id,
  })
    .populate("area", "name")
    .sort({ createdAt: -1 });

  res.json(requests);
});

/**
 * =====================================================
 * GET SINGLE SERVICE REQUEST
 * GET /portal/service-requests/:id
 * =====================================================
 */
const getMyServiceRequestById = asyncHandler(async (req, res) => {
  const { companySlug, id } = req.params;

  /**
   * =====================================================
   * RESOLVE COMPANY FROM URL SLUG
   * =====================================================
   */
  const company = await Company.findOne({
    slug: companySlug,
    isActive: true,
  });

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  /**
   * =====================================================
   * FIND REQUEST
   * =====================================================
   */
  const request = await ServiceRequest.findOne({
    _id: id,
    company: company._id,
    customer: req.customer._id,
  })
    .populate("area", "name")
    .populate("customer", "name phone");

  if (!request) {
    res.status(404);
    throw new Error("Service request not found");
  }

  res.json(request);
});



/**
 * =====================================================
 * CANCEL SERVICE REQUEST (OPTIONAL BUT USEFUL)
 * PATCH /portal/service-requests/:id/cancel
 * =====================================================
 */
const cancelServiceRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findOne({
    _id: req.params.id,
    company: req.company._id,
    customer: req.customer._id,
  });

  if (!request) {
    res.status(404);
    throw new Error("Service request not found");
  }

  if (request.status !== "open") {
    res.status(400);
    throw new Error("Only open requests can be cancelled");
  }

  request.status = "cancelled";
  await request.save();

  await logActivity({
    company: req.company._id,
    entityType: "ServiceRequest",
    entityId: request._id,
    action: "CUSTOMER_CANCEL_SERVICE_REQUEST",
    message: `Customer cancelled service request`,
  });

  res.json({
    message: "Service request cancelled successfully",
  });
});

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */
export {
  createCustomerServiceRequest,
  getMyServiceRequests,
  getMyServiceRequestById,
  cancelServiceRequest,
};