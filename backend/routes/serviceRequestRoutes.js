import express from "express";

import {
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
} from "../controllers/serviceRequestController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================================================
 * SERVICE REQUEST ACCESS RULES
 * =========================================================
 *
 * manager:
 *   Full access
 *   (Company admin)
 *
 * dispatcher:
 *   Create / view / update / assign / convert / close
 *
 * technician:
 *   View assigned requests
 *   Add internal messages
 *
 * =========================================================
 * BASE ROUTE
 * =========================================================
 *
 * /api/service-requests
 *
 * IMPORTANT:
 * Every request is tenant-isolated using:
 * req.user.company
 *
 * inside controllers.
 *
 * =========================================================
 */

/**
 * =========================================================
 * CREATE / LIST SERVICE REQUESTS
 * =========================================================
 */

router
  .route("/")

  /**
   * @desc    Create service request
   * @access  Manager, Dispatcher
   */
  .post(
    protect,
    authorize(
      "manager",
      "dispatcher"
    ),
    createServiceRequest
  )

  /**
   * @desc    Get all service requests
   * @access  Manager, Dispatcher, Technician
   */
  .get(
    protect,
    authorize(
      "manager",
      "dispatcher",
      "technician"
    ),
    getServiceRequests
  );

/**
 * =========================================================
 * SINGLE SERVICE REQUEST
 * =========================================================
 */
router.get(
  "/:id/accept-preview",
  protect,
  authorize("technician"),
  getServiceRequestAcceptPreview
);
router
  .route("/:id")

  /**
   * @desc    Get service request by ID
   * @access  Manager, Dispatcher, Technician
   */
  .get(
    protect,
    authorize(
      "manager",
      "dispatcher",
      "technician"
    ),
    getServiceRequestById
  )

  /**
   * @desc    Update service request
   * @access  Manager, Dispatcher
   */
  .put(
    protect,
    authorize(
      "manager",
      "dispatcher"
    ),
    updateServiceRequest
  )

  /**
   * @desc    Soft delete service request
   * @access  Manager only
   */
  .delete(
    protect,
    authorize("manager"),
    deleteServiceRequest
  );

/**
 * =========================================================
 * ASSIGN TECHNICIAN
 * =========================================================
 */

router
  .route("/:id/assign-technician")

  /**
   * @desc    Assign technician
   * @access  Manager, Dispatcher
   */
  .patch(
    protect,
    authorize(
      "manager",
      "dispatcher"
    ),
    assignTechnician
  );

/**
 * =========================================================
 * INTERNAL MESSAGE / COMMUNICATION
 * =========================================================
 */

router
  .route("/:id/messages")

  /**
   * @desc    Add message to request
   * @access  Manager, Dispatcher, Technician
   */
  .post(
    protect,
    authorize(
      "manager",
      "dispatcher",
      "technician"
    ),
    addServiceRequestMessage
  );

/**
 * =========================================================
 * CONVERT REQUEST -> ACTIVE JOB
 * =========================================================
 */

router
  .route("/:id/convert")

  /**
   * @desc    Convert request to job
   * @access  Manager, Dispatcher
   */
  .patch(
    protect,
    authorize(
      "manager",
      "dispatcher"
    ),
    convertServiceRequest
  );

/**
 * =========================================================
 * CLOSE SERVICE REQUEST
 * =========================================================
 */

router
  .route("/:id/close")

  /**
   * @desc    Close request
   * @access  Manager, Dispatcher
   */
  .patch(
    protect,
    authorize(
      "manager",
      "dispatcher"
    ),
    closeServiceRequest
  );

export default router;