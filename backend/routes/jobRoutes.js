// routes/jobRoutes.js

import express from "express";

import {
  acceptServiceRequest,
  createJob,
  getJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  getJobsByCustomer,
  deleteJob,
} from "../controllers/jobController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================================================
 * JOB ACCESS RULES (UPDATED)
 * =========================================================
 *
 * Admin:
 *   - Company management only
 *   - NO access to jobs
 *
 * Manager:
 *   - Full operational job access
 *
 * Dispatcher:
 *   - Schedule/create/update jobs
 *   - Assign technicians
 *
 * Technician:
 *   - Accept service requests
 *   - View only assigned jobs
 *   - Update own job statuses
 *
 * =========================================================
 */

/**
 * =========================================================
 * SERVICE REQUEST ACCEPTANCE
 * =========================================================
 *
 * Technician accepts nearby service request
 * System auto-creates job
 *
 * POST /api/jobs/accept/:serviceRequestId
 */
// routes/jobRoutes.js

router.get(
  "/customer/:customerId",
  protect,
  getJobsByCustomer
);
router.post(
  "/accept/:serviceRequestId",
  protect,
  authorize("technician"),
  acceptServiceRequest
);

/**
 * =========================================================
 * BASE ROUTE: /api/jobs
 * =========================================================
 */

/**
 * CREATE JOB
 *
 * Manual dispatch/scheduling
 *
 * Allowed:
 *   - manager
 *   - dispatcher
 *
 * NOT allowed:
 *   - admin
 *   - technician
 */

router.post(
  "/",
  protect,
  authorize(
    "manager",
    "dispatcher"
  ),
  createJob
);

/**
 * GET JOBS
 *
 * Allowed:
 *   - manager
 *   - dispatcher
 *   - technician
 *
 * NOT allowed:
 *   - admin
 *
 * NOTE:
 * Technicians only see THEIR jobs
 * (handled in controller)
 */

router.get(
  "/",
  protect,
  authorize(
    "manager",
    "dispatcher",
    "technician"
  ),
  getJobs
);

/**
 * =========================================================
 * JOB BY ID ROUTES
 * =========================================================
 */

router
  .route("/:id")

  /**
   * GET JOB DETAILS
   *
   * Allowed:
   *   - manager
   *   - dispatcher
   *   - technician
   *
   * NOT allowed:
   *   - admin
   *
   * NOTE:
   * Technician ownership validation
   * handled inside controller
   */

  .get(
    protect,
    authorize(
      "manager",
      "dispatcher",
      "technician"
    ),
    getJobById
  )

  /**
   * FULL JOB UPDATE
   *
   * Allowed:
   *   - manager
   *   - dispatcher
   *
   * NOT allowed:
   *   - admin
   *   - technician
   */

  .put(
    protect,
    authorize(
      "manager",
      "dispatcher"
    ),
    updateJob
  )

  /**
   * DELETE JOB
   *
   * Allowed:
   *   - manager
   *   - dispatcher
   *
   * NOT allowed:
   *   - admin
   *   - technician
   */

  .delete(
    protect,
    authorize(
      "manager",
      "dispatcher"
    ),
    deleteJob
  );

/**
 * =========================================================
 * QUICK STATUS UPDATE
 * =========================================================
 *
 * PATCH /api/jobs/:id/status
 *
 * Used for:
 *   - assigned
 *   - scheduled
 *   - enroute
 *   - in_progress
 *   - completed
 *   - cancelled
 *
 * Technicians can update statuses
 * ONLY on jobs assigned to them
 * (validated in controller)
 *
 * Admin has NO access
 */

router.patch(
  "/:id/status",
  protect,
  authorize(
    "manager",
    "dispatcher",
    "technician"
  ),
  updateJobStatus
);

export default router;