import asyncHandler from "../middleware/asyncHandler.js";

import ServiceRequest from "../models/serviceRequestModel.js";
import Company from "../models/companyModel.js";
import Customer from "../models/customerModel.js";
import Technician from "../models/technicianModel.js";
import City from "../models/cityModel.js";
import Area from "../models/areaModel.js";

import Notification from "../models/notificationModel.js";

import { logActivity } from "../utils/activityLogger.js";

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

const addTimelineEntry = (
  request,
  {
    status,
    message,
    updatedBy = "system",
    technician = null,
  }
) => {
  request.timeline.push({
    status,
    message,
    updatedBy,
    technician,
  });
};

/**
 * =========================================================
 * @desc    Create service request
 * @access  Manager, Dispatcher
 * =========================================================
 */

const createServiceRequest = asyncHandler(async (req, res) => {
  console.log("Hit the correct controller");
const {
    customer,
    title,
    issueType,
    description,
    priority,
    source,
    preferredDate,
    preferredTimeSlot,
    requiredSkills,
    serviceAddress,
    attachments,
    customerNotes,
  } = req.body;
console.log(customer);
 
  if (!["manager", "dispatcher"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Access denied");
  }

  
  /**
   * =====================================================
   * COMPANY VALIDATION
   * =====================================================
   */
  const company = await Company.findById(req.user.company).select("settings");

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  if (!company.settings.allowOnlineBooking) {
    res.status(403);
    throw new Error("Service requests are disabled for this company");
  }

  /**
   * =====================================================
   * CUSTOMER VALIDATION
   * =====================================================
   */
  const customerDoc = await Customer.findOne({
    _id: customer,
    company: req.user.company,
    isActive: true,
  }).populate({
    path: "area",
    populate: {
      path: "city",
      select: "name",
    },
  });

  if (!customerDoc) {
    res.status(404);
    throw new Error("Customer not found");
  }

  if (!customerDoc.area) {
    res.status(400);
    throw new Error("Customer does not have an assigned area");
  }

  /**
   * =====================================================
   * SAFE AREA / CITY RESOLUTION
   * =====================================================
   */
  const areaId = customerDoc.area._id;

  const cityId = customerDoc.area.city?._id
    ? customerDoc.area.city._id
    : customerDoc.area.city;

  if (!cityId) {
    res.status(400);
    throw new Error("Customer area does not have a valid city");
  }

  /**
   * =====================================================
   * SAFE SERVICE ADDRESS NORMALIZATION
   * =====================================================
   */
  const safeServiceAddress =
    typeof serviceAddress === "object" && serviceAddress !== null
      ? serviceAddress
      : customerDoc.address || {};

  /**
   * =====================================================
   * SOURCE NORMALIZATION
   * =====================================================
   */
  const allowedSources = new Set([
    "call",
    "admin",
    "WEB",
    "customer_portal",
    "mobile_app",
    "website",
    "phone_call",
    "walk_in",
    "api",
  ]);

  const normalizedSource = allowedSources.has(source)
    ? source
    : "admin";

  /**
   * =====================================================
   * SERVICE REQUEST CREATION
   * =====================================================
   */
  const request = new ServiceRequest({
    company: req.user.company,
    customer: customerDoc._id,
    area: areaId,
    city: cityId || req.body.city,

    customerSnapshot: {
      name: customerDoc.name,
      phone: customerDoc.phone,
      email: customerDoc.email,
      address: customerDoc.address,
    },

    serviceAddress: safeServiceAddress,

    title,
    issueType,
    requiredSkills: Array.isArray(requiredSkills)
      ? requiredSkills
      : [],

    description,
    priority: priority || "medium",
    source: normalizedSource,

    preferredDate,
    preferredTimeSlot: preferredTimeSlot || "anytime",

    attachments: Array.isArray(attachments)
      ? attachments
      : [],

    customerNotes: customerNotes || "",
  });

  /**
   * =====================================================
   * TIMELINE ENTRY
   * =====================================================
   */
  addTimelineEntry(request, {
    status: "new",
    message: "Service request created",
    updatedBy: "admin",
  });

  const savedRequest = await request.save();

  /**
   * =====================================================
   * NOTIFY TECHNICIANS
   * =====================================================
   */
  const technicians = await Technician.find({
    company: req.user.company,
    areas: areaId,
    isAvailable: true,
  });

  if (technicians.length > 0) {
    const notifications = technicians.map((tech) => ({
      company: req.user.company,
      area: areaId,

      recipientType: "Technician",
      recipient: tech._id,

      serviceRequest: savedRequest._id,

      title: "New Service Request",
      message: `New ${issueType} request in your area`,

      channel: "IN_APP",
      status: "pending",

      metadata: {
        priority,
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
    company: req.user.company,
    entityType: "ServiceRequest",
    entityId: savedRequest._id,
    action: "CREATE_SERVICE_REQUEST",
    message: `Service request created for ${issueType}`,
  });

  /**
   * =====================================================
   * RESPONSE POPULATION
   * =====================================================
   */
  const populatedRequest = await ServiceRequest.findById(savedRequest._id)
    .populate("customer", "name phone email")
    .populate({
      path: "area",
      populate: {
        path: "city",
        select: "name",
      },
    });

  res.status(201).json(populatedRequest);
});

/**
 * =========================================================
 * @desc    Get all service requests
 * @access  Manager, Dispatcher, Technician
 * =========================================================
 */
const getServiceRequestAcceptPreview =
  asyncHandler(async (req, res) => {
    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,
        company: req.user.company,
        isDeleted: false,
      })
        .populate("customer", "name")
        .select(
          "customer issueType priority status createdAt"
        );

    if (!request) {
      res.status(404);

      throw new Error(
        "Service request not found"
      );
    }

    res.json(request);
  });
const getServiceRequests =
  asyncHandler(async (req, res) => {
    const {
      status,
      priority,
      customer,
      area,
      issueType,
      assignedTechnician,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const query = {
      company: req.user.company,

      isDeleted: false,
    };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (customer) {
      query.customer = customer;
    }

    if (area) {
      query.area = area;
    }

    if (issueType) {
      query.issueType = issueType;
    }

    if (assignedTechnician) {
      query.assignedTechnician =
        assignedTechnician;
    }

    /**
     * =====================================================
     * SEARCH
     * =====================================================
     */

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          requestNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /**
     * =====================================================
     * TECHNICIAN RESTRICTION
     * =====================================================
     */

    if (req.user.role === "technician") {
      const technician =
        await Technician.findOne({
          user: req.user._id,

          company: req.user.company,
        });

      if (!technician) {
        res.status(404);

        throw new Error(
          "Technician profile not found"
        );
      }

      query.assignedTechnician =
        technician._id;
    }

    const skip =
      (Number(page) - 1) *
      Number(limit);

    const requests =
      await ServiceRequest.find(query)
        .populate(
          "customer",
          "name phone email"
        )
        .populate("area", "name")
        .populate(
          "assignedTechnician",
          "name phone"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const count =
      await ServiceRequest.countDocuments(
        query
      );

    res.json({
      serviceRequests: requests,

      page: Number(page),

      pages: Math.ceil(
        count / Number(limit)
      ),

      total: count,
    });
  });

/**
 * =========================================================
 * @desc    Get service request by ID
 * @access  Manager, Dispatcher, Technician
 * =========================================================
 */

const getServiceRequestById =
  asyncHandler(async (req, res) => {
    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,

        company: req.user.company,

        isDeleted: false,
      })
        .populate("customer")
        .populate("area")
        .populate(
          "assignedTechnician"
        );

    if (!request) {
      res.status(404);

      throw new Error(
        "Service request not found"
      );
    }

    /**
     * =====================================================
     * TECHNICIAN ACCESS RESTRICTION
     * =====================================================
     */

    if (req.user.role === "technician") {
      const technician =
        await Technician.findOne({
          user: req.user._id,

          company: req.user.company,
        });

      if (!technician) {
        res.status(403);

        throw new Error(
          "Technician profile not found"
        );
      }

      if (
        request.assignedTechnician &&
        request.assignedTechnician._id.toString() !==
          technician._id.toString()
      ) {
        res.status(403);

        throw new Error(
          "Access denied"
        );
      }
    }

    res.json(request);
  });

/**
 * =========================================================
 * @desc    Update service request
 * @access  Manager, Dispatcher
 * =========================================================
 */

const updateServiceRequest =
  asyncHandler(async (req, res) => {
    if (
      !["manager", "dispatcher"].includes(
        req.user.role
      )
    ) {
      res.status(403);

      throw new Error("Access denied");
    }

    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,

        company: req.user.company,

        isDeleted: false,
      });

    if (!request) {
      res.status(404);

      throw new Error(
        "Service request not found"
      );
    }

    const oldStatus =
      request.status;

    const oldPriority =
      request.priority;

    /**
     * =====================================================
     * UPDATE FIELDS
     * =====================================================
     */

    request.title =
      req.body.title ||
      request.title;

    request.issueType =
      req.body.issueType ||
      request.issueType;

    request.description =
      req.body.description ||
      request.description;

    request.priority =
      req.body.priority ||
      request.priority;

    request.status =
      req.body.status ||
      request.status;

    request.source =
      req.body.source ||
      request.source;

    request.preferredDate =
      req.body.preferredDate ||
      request.preferredDate;

    request.preferredTimeSlot =
      req.body.preferredTimeSlot ||
      request.preferredTimeSlot;

    request.customerNotes =
      req.body.customerNotes ??
      request.customerNotes;

    request.internalNotes =
      req.body.internalNotes ??
      request.internalNotes;

    if (
      req.body.requiredSkills
    ) {
      request.requiredSkills =
        req.body.requiredSkills;
    }

    if (
      req.body.serviceAddress
    ) {
      request.serviceAddress =
        req.body.serviceAddress;
    }

    /**
     * =====================================================
     * ATTACHMENTS
     * =====================================================
     */

    if (
      Array.isArray(
        req.body.attachments
      )
    ) {
      request.attachments = [
        ...request.attachments,
        ...req.body.attachments,
      ];
    }

    /**
     * =====================================================
     * STATUS CHANGE TIMELINE
     * =====================================================
     */

    if (
      req.body.status &&
      req.body.status !== oldStatus
    ) {
      addTimelineEntry(request, {
        status: req.body.status,

        message: `Status changed from ${oldStatus} to ${req.body.status}`,

        updatedBy: "admin",
      });

      if (
        req.body.status ===
        "completed"
      ) {
        request.resolvedAt =
          new Date();
      }

      if (
        req.body.status ===
        "closed"
      ) {
        request.closedAt =
          new Date();
      }
    }

    const updated =
      await request.save();

    /**
     * =====================================================
     * ACTIVITY LOGS
     * =====================================================
     */

    if (
      req.body.status &&
      req.body.status !== oldStatus
    ) {
      await logActivity({
        company:
          req.user.company,

        entityType:
          "ServiceRequest",

        entityId:
          request._id,

        action:
          "UPDATE_STATUS",

        message: `Status changed from ${oldStatus} to ${req.body.status}`,
      });
    }

    if (
      req.body.priority &&
      req.body.priority !==
        oldPriority
    ) {
      await logActivity({
        company:
          req.user.company,

        entityType:
          "ServiceRequest",

        entityId:
          request._id,

        action:
          "UPDATE_PRIORITY",

        message: `Priority changed from ${oldPriority} to ${req.body.priority}`,
      });
    }

    res.json(updated);
  });

/**
 * =========================================================
 * @desc    Assign technician
 * @access  Manager, Dispatcher
 * =========================================================
 */

const assignTechnician =
  asyncHandler(async (req, res) => {
    if (
      !["manager", "dispatcher"].includes(
        req.user.role
      )
    ) {
      res.status(403);

      throw new Error("Access denied");
    }

    const {
      technicianId,
    } = req.body;

    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,

        company: req.user.company,

        isDeleted: false,
      });

    if (!request) {
      res.status(404);

      throw new Error(
        "Service request not found"
      );
    }

    const technician =
      await Technician.findOne({
        _id: technicianId,

        company: req.user.company,
      });

    if (!technician) {
      res.status(404);

      throw new Error(
        "Technician not found"
      );
    }

    request.assignedTechnician =
      technician._id;

    request.assignmentStatus =
      "assigned";

    request.status = "assigned";

    request.assignedAt =
      new Date();

    addTimelineEntry(request, {
      status: "assigned",

      message: `Assigned to technician ${technician.name}`,

      updatedBy: "admin",

      technician:
        technician._id,
    });

    await request.save();

    await logActivity({
      company: req.user.company,

      entityType:
        "ServiceRequest",

      entityId: request._id,

      action:
        "ASSIGN_TECHNICIAN",

      message: `Assigned technician ${technician.name}`,
    });

    res.json(request);
  });

/**
 * =========================================================
 * @desc    Add message to service request
 * @access  Manager, Dispatcher, Technician
 * =========================================================
 */

const addServiceRequestMessage =
  asyncHandler(async (req, res) => {
    const { message } =
      req.body;

    if (!message) {
      res.status(400);

      throw new Error(
        "Message is required"
      );
    }

    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,

        company: req.user.company,

        isDeleted: false,
      });

    if (!request) {
      res.status(404);

      throw new Error(
        "Service request not found"
      );
    }

    request.messages.push({
      senderType:
        req.user.role ===
        "technician"
          ? "technician"
          : "admin",

      senderName:
        req.user.name,

      message,
    });

    await request.save();

    res.json({
      message:
        "Message added successfully",
    });
  });

/**
 * =========================================================
 * @desc    Convert service request → Job
 * @access  Manager, Dispatcher
 * =========================================================
 */

const convertServiceRequest =
  asyncHandler(async (req, res) => {
    if (
      !["manager", "dispatcher"].includes(
        req.user.role
      )
    ) {
      res.status(403);

      throw new Error("Access denied");
    }

    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,

        company: req.user.company,

        isDeleted: false,
      });

    if (!request) {
      res.status(404);

      throw new Error(
        "Service request not found"
      );
    }

    request.status =
      "in_progress";

    addTimelineEntry(request, {
      status: "in_progress",

      message:
        "Service request converted to active job",

      updatedBy: "admin",
    });

    const updated =
      await request.save();

    await logActivity({
      company: req.user.company,

      entityType:
        "ServiceRequest",

      entityId: request._id,

      action:
        "CONVERT_TO_JOB",

      message:
        "Service request converted to job",
    });

    res.json(updated);
  });

/**
 * =========================================================
 * @desc    Close service request
 * @access  Manager, Dispatcher
 * =========================================================
 */

const closeServiceRequest =
  asyncHandler(async (req, res) => {
    if (
      !["manager", "dispatcher"].includes(
        req.user.role
      )
    ) {
      res.status(403);

      throw new Error("Access denied");
    }

    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,

        company: req.user.company,

        isDeleted: false,
      });

    if (!request) {
      res.status(404);

      throw new Error(
        "Service request not found"
      );
    }

    request.status = "closed";

    request.closedAt =
      new Date();

    addTimelineEntry(request, {
      status: "closed",

      message:
        "Service request closed",

      updatedBy: "admin",
    });

    const updated =
      await request.save();

    await logActivity({
      company: req.user.company,

      entityType:
        "ServiceRequest",

      entityId: request._id,

      action:
        "CLOSE_SERVICE_REQUEST",

      message:
        "Service request closed",
    });

    res.json(updated);
  });

/**
 * =========================================================
 * @desc    Delete service request
 * @access  Manager only
 * =========================================================
 */

const deleteServiceRequest =
  asyncHandler(async (req, res) => {
    if (
      req.user.role !==
      "manager"
    ) {
      res.status(403);

      throw new Error(
        "Only managers can delete service requests"
      );
    }

    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,

        company: req.user.company,
      });

    if (!request) {
      res.status(404);

      throw new Error(
        "Service request not found"
      );
    }

    request.isDeleted = true;

    await request.save();

    await logActivity({
      company: req.user.company,

      entityType:
        "ServiceRequest",

      entityId: request._id,

      action:
        "DELETE_SERVICE_REQUEST",

      message:
        "Service request deleted",
    });

    res.json({
      message:
        "Service request removed",
    });
  });

export {
  createServiceRequest,
  getServiceRequestAcceptPreview,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  assignTechnician,
  addServiceRequestMessage,
  convertServiceRequest,
  closeServiceRequest,
  deleteServiceRequest,
};