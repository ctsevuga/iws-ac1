import asyncHandler from '../middleware/asyncHandler.js';
import Notification from "../models/notificationModel.js";
import Technician from "../models/technicianModel.js";

//
// Helper
//
const isAdminRole = (role) =>
  ["manager", "dispatcher"].includes(role);

//
// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
//
export const getNotifications = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const status = req.query.status;
  const technicianId = req.query.technician;

  let query = {
    company: req.user.company,
  };

  /**
   * TECHNICIAN
   * Must resolve Technician document first
   */
  if (req.user.role === "technician") {
    const technician = await Technician.findOne({
      user: req.user._id,
      company: req.user.company,
    });

    if (!technician) {
      res.status(404);
      throw new Error("Technician profile not found");
    }

    query.recipient = technician._id;
    query.recipientType = "Technician";
  }

  /**
   * ADMIN / MANAGER / DISPATCHER
   */
  else if (isAdminRole(req.user.role)) {
    query.recipientType = "Technician";

    /**
     * Optional technician filter (admin only)
     */
    if (technicianId) {
      query.recipient = technicianId;
    }
  }

  /**
   * BLOCK EVERYTHING ELSE
   */
  else {
    res.status(403);
    throw new Error("Access denied");
  }

  /**
   * Optional status filter
   */
  if (status) {
    query.status = status;
  }

  /**
   * Fetch notifications
   */
  const notifications = await Notification.find(query)
    .populate("recipient", "name email phone")
    .populate("area", "name city state")
    .populate(
      "serviceRequest",
      "issueType priority preferredDate status"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  /**
   * Count total
   */
  const total = await Notification.countDocuments(query);

  res.json({
    page,
    pages: Math.ceil(total / limit),
    total,
    results: notifications,
  });
});

//
// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
//
export const getNotificationById = asyncHandler(
  async (req, res) => {
    let query = {
      _id: req.params.id,
      company: req.user.company
    };

    /**
     * TECHNICIAN
     * Can only view own notification
     */
    if (req.user.role === "technician") {
  const technician = await Technician.findOne({
    user: req.user._id,
    company: req.user.company,
  });

  if (!technician) {
    res.status(404);
    throw new Error("Technician profile not found");
  }

  query.recipient = technician._id;
  query.recipientType = "Technician";
}

    /**
     * MANAGER / DISPATCHER
     * Can view all technician notifications
     */
    else if (isAdminRole(req.user.role)) {
      query.recipientType = "Technician";
    } else {
      res.status(403);
      throw new Error("Access denied");
    }

    const notification = await Notification.findOne(
      query
    )
      .populate(
        "recipient",
        "name email phone"
      )
      .populate(
        "serviceRequest",
        `
        issueType
        description
        priority
        preferredDate
        status
        customer
        `
      );

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    res.json(notification);
  }
);

//
// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
//
export const markNotificationAsRead =
  asyncHandler(async (req, res) => {
    /**
     * Only technicians should mark
     * their own notifications as read
     */
    if (req.user.role !== "technician") {
      res.status(403);
      throw new Error(
        "Only technicians can mark notifications as read"
      );
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      company: req.user.company,
      recipient: req.user._id,
      recipientType: "Technician"
    });

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    notification.status = "read";
    notification.readAt = new Date();

    await notification.save();

    res.json({
      message: "Notification marked as read"
    });
  });

  export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  let recipientId;

  if (req.user.role === "technician") {
    const technician = await Technician.findOne({
      user: req.user._id,
      company: req.user.company,
    });

    if (!technician) {
      res.status(404);
      throw new Error("Technician profile not found");
    }

    recipientId = technician._id;
  } else {
    res.status(403);
    throw new Error("Access denied");
  }

  const count = await Notification.countDocuments({
    company: req.user.company,
    recipient: recipientId,
    recipientType: "Technician",
    status: "pending",
  });

  res.json({ unreadCount: count });
});