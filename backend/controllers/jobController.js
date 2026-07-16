import asyncHandler from '../middleware/asyncHandler.js';
import Job from '../models/jobModel.js';
import Notification from '../models/notificationModel.js';
import Company from '../models/companyModel.js';
import Technician from '../models/technicianModel.js';
import ServiceRequest from '../models/serviceRequestModel.js';
import { logActivity } from '../utils/activityLogger.js';

/**
 * =========================================================
 * ROLE HELPERS
 * =========================================================
 */

const JOB_ACCESS_ROLES = [
  'dispatcher',
  'manager',
  'technician',
];

const JOB_MANAGEMENT_ROLES = [
  'dispatcher',
  'manager',
];

const canAccessJobs = (role) =>
  JOB_ACCESS_ROLES.includes(role);

const canManageJobs = (role) =>
  JOB_MANAGEMENT_ROLES.includes(role);

/**
 * 🔧 Helper: Auto Assign Technician
 * Basic FIFO assignment
 */
const getAutoAssignedTechnician = async (companyId) => {
  return await Technician.findOne({
    company: companyId,
    isActive: true,
  }).sort({ createdAt: 1 });
};

/**
 * @desc    Technician accepts service request
 * @route   POST /api/jobs/accept/:serviceRequestId
 * @access  Technician
 */
const acceptServiceRequest = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;

  /**
   * =========================================================
   * VALIDATE TECHNICIAN
   * =========================================================
   */

  const technician = await Technician.findOne({
    user: req.user._id,
    company: req.user.company,
  });

  if (!technician) {
    res.status(404);

    throw new Error('Technician not found');
  }

  if (!technician.isAvailable) {
    res.status(403);

    throw new Error(
      'Inactive technicians cannot accept requests'
    );
  }

  /**
   * =========================================================
   * ATOMIC ASSIGNMENT LOCK
   * =========================================================
   */

  const request =
    await ServiceRequest.findOneAndUpdate(
      {
        _id: serviceRequestId,
        company: technician.company,
        status: 'new',
        assignmentStatus: 'pending',
      },
      {
        status: 'assigned',
        assignmentStatus: 'assigned',
        assignedTechnician: technician._id,
      },
      {
        new: true,
      }
    ).populate('customer');

  /**
   * =========================================================
   * REQUEST NOT AVAILABLE
   * =========================================================
   */

  if (!request) {
    return res.status(409).json({
      message:
        'This service request has already been assigned',
    });
  }

  /**
   * =========================================================
   * PREVENT DUPLICATE JOBS
   * =========================================================
   */

  const existingJob =
    await Job.findOne({
      serviceRequest: request._id,
    });

  if (existingJob) {
    return res.status(409).json({
      message:
        'Job already exists for this service request',
    });
  }

  /**
   * =========================================================
   * CREATE JOB
   * =========================================================
   */

  const job = await Job.create({
    company: request.company,
    serviceRequest: request._id,
    customer: request.customer._id,
    technician: technician._id,
    serviceType: request.issueType,
    status: 'assigned',
    priority: request.priority,
    scheduledAt:
      request.preferredDate || null,
    location:
      request.location || null,
  });

  /**
   * =========================================================
   * UPDATE NOTIFICATIONS
   * =========================================================
   */

  await Notification.updateMany(
    {
      serviceRequest: request._id,
      status: 'pending',
    },
    {
      status: 'sent',
    }
  );

  /**
   * =========================================================
   * ACTIVITY LOGS
   * =========================================================
   */

  await logActivity({
    company: request.company,
    entityType: 'ServiceRequest',
    entityId: request._id,
    action: 'ACCEPT_REQUEST',
    message:
      'Service request accepted and job created',
  });

  await logActivity({
    company: request.company,
    entityType: 'Job',
    entityId: job._id,
    action: 'CREATE_JOB',
    message:
      'Job automatically created from accepted service request',
  });

  /**
   * =========================================================
   * RESPONSE
   * =========================================================
   */

  res.status(200).json({
    message:
      'Job assigned successfully',
    job,
    serviceRequest: request,
  });
});

/**
 * @desc    Create new job manually
 * @route   POST /api/jobs
 * @access  Dispatcher / Manager
 */
const createJob = asyncHandler(async (req, res) => {
  const {
    serviceRequest,
    customer,
    technician,
    serviceType,
    scheduledAt,
    notes,
    location,
    estimatedCost,
    priority,
  } = req.body;

  /**
   * =========================================================
   * ROLE VALIDATION
   * =========================================================
   */

  if (!canManageJobs(req.user.role)) {
    res.status(403);

    throw new Error(
      'You are not authorized to create jobs'
    );
  }

  const company = await Company.findById(
    req.user.company
  ).select('settings');

  if (!company) {
    res.status(404);

    throw new Error('Company not found');
  }

  let assignedTechnician = technician;

  /**
   * =========================================================
   * AUTO ASSIGN TECHNICIAN
   * =========================================================
   */

  if (
    !technician &&
    company.settings?.autoAssignTechnician
  ) {
    const autoTechnician =
      await getAutoAssignedTechnician(
        req.user.company
      );

    if (autoTechnician) {
      assignedTechnician =
        autoTechnician._id;
    }
  }

  /**
   * =========================================================
   * PREVENT DUPLICATE JOBS
   * =========================================================
   */

  if (serviceRequest) {
    const existingJob =
      await Job.findOne({
        serviceRequest,
      });

    if (existingJob) {
      res.status(409);

      throw new Error(
        'Job already exists for this service request'
      );
    }
  }

  /**
   * =========================================================
   * CREATE JOB
   * =========================================================
   */

  const job = await Job.create({
    company: req.user.company,
    serviceRequest:
      serviceRequest || null,
    customer,
    technician:
      assignedTechnician || null,
    serviceType,
    scheduledAt,
    notes,
    location,
    estimatedCost,
    priority: priority || 'medium',

    status: assignedTechnician
      ? 'assigned'
      : 'scheduled',
  });

  /**
   * =========================================================
   * SYNC SERVICE REQUEST
   * =========================================================
   */

  if (serviceRequest) {
    await ServiceRequest.findByIdAndUpdate(
      serviceRequest,
      {
        status: assignedTechnician
          ? 'assigned'
          : 'scheduled',
        assignmentStatus:
          assignedTechnician
            ? 'assigned'
            : 'pending',
        assignedTechnician:
          assignedTechnician || null,
      }
    );
  }

  /**
   * =========================================================
   * ACTIVITY LOGS
   * =========================================================
   */

  await logActivity({
    company: req.user.company,
    entityType: 'Job',
    entityId: job._id,
    action: 'CREATE_JOB',
    message:
      'Job created manually by dispatcher/manager',
  });

  res.status(201).json(job);
});

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  Company Users
 */
const getJobs = asyncHandler(async (req, res) => {
  /**
   * =========================================================
   * ROLE VALIDATION
   * =========================================================
   */

  if (!canAccessJobs(req.user.role)) {
    res.status(403);

    throw new Error(
      'You are not authorized to access jobs'
    );
  }

  const {
    status,
    technician,
    customer,
    page = 1,
    limit = 20,
  } = req.query;

  const query = {
    company: req.user.company,
  };

  /**
   * =========================================================
   * TECHNICIAN ACCESS
   * =========================================================
   */

  if (req.user.role === 'technician') {
    const technicianProfile =
      await Technician.findOne({
        user: req.user._id,
        company: req.user.company,
      });

    if (!technicianProfile) {
      res.status(403);

      throw new Error(
        'Technician profile not found'
      );
    }

    query.technician =
      technicianProfile._id;
  }

  /**
   * =========================================================
   * FILTERS
   * =========================================================
   */

  if (status) {
    query.status = status;
  }

  if (
    technician &&
    req.user.role !== 'technician'
  ) {
    query.technician = technician;
  }

  if (customer) {
    query.customer = customer;
  }

  const skip =
    (Number(page) - 1) *
    Number(limit);

  /**
   * =========================================================
   * FETCH JOBS
   * =========================================================
   */

  const jobs = await Job.find(query)
    .populate(
      'customer',
      'name phone'
    )
    .populate({
      path: 'technician',
      populate: {
        path: 'user',
        select:
          'phone email name',
      },
    })
    .populate({
      path: 'serviceRequest',
      select:
        'issueType priority status',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const count =
    await Job.countDocuments(query);

  res.json({
    jobs,
    page: Number(page),
    pages: Math.ceil(
      count / Number(limit)
    ),
    total: count,
  });
});

/**
 * @desc    Get job by ID
 * @route   GET /api/jobs/:id
 * @access  Company Users
 */
const getJobById = asyncHandler(async (req, res) => {
  /**
   * =========================================================
   * ROLE VALIDATION
   * =========================================================
   */

  if (!canAccessJobs(req.user.role)) {
    res.status(403);

    throw new Error(
      'You are not authorized to access jobs'
    );
  }

  const query = {
    _id: req.params.id,
    company: req.user.company,
  };

  /**
   * =========================================================
   * TECHNICIAN ACCESS
   * =========================================================
   */

  if (req.user.role === 'technician') {
    const technician =
      await Technician.findOne({
        user: req.user._id,
        company: req.user.company,
      });

    if (!technician) {
      res.status(403);

      throw new Error(
        'Technician not found'
      );
    }

    query.technician =
      technician._id;
  }

  /**
   * =========================================================
   * FETCH JOB
   * =========================================================
   */

  const job = await Job.findOne(query)
    .populate('customer')
    .populate({
      path: 'technician',
      populate: {
        path: 'user',
        select:
          'phone email name',
      },
    })
    .populate('serviceRequest');

  if (!job) {
    res.status(404);

    throw new Error('Job not found');
  }

  res.json(job);
});

/**
 * @desc    Update full job
 * @route   PUT /api/jobs/:id
 * @access  Dispatcher / Manager
 */
const updateJob = asyncHandler(async (req, res) => {
  /**
   * =========================================================
   * ROLE VALIDATION
   * =========================================================
   */

  if (!canManageJobs(req.user.role)) {
    res.status(403);

    throw new Error(
      'You are not authorized to update jobs'
    );
  }

  const job = await Job.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!job) {
    res.status(404);

    throw new Error('Job not found');
  }

  const oldTechnician =
    job.technician?.toString();

  const oldStatus = job.status;

  /**
   * =========================================================
   * UPDATE FIELDS
   * =========================================================
   */

  job.serviceType =
    req.body.serviceType ||
    job.serviceType;

  job.scheduledAt =
    req.body.scheduledAt ||
    job.scheduledAt;

  job.notes =
    req.body.notes || job.notes;

  job.location =
    req.body.location ||
    job.location;

  job.estimatedCost =
    req.body.estimatedCost ??
    job.estimatedCost;

  job.actualCost =
    req.body.actualCost ??
    job.actualCost;

  job.priority =
    req.body.priority ||
    job.priority;

  if (req.body.status) {
    job.status =
      req.body.status;
  }

  /**
   * =========================================================
   * UPDATE TECHNICIAN
   * =========================================================
   */

  if (req.body.technician) {
    const technician =
      await Technician.findOne({
        _id: req.body.technician,
        company: req.user.company,
        isActive: true,
      });

    if (!technician) {
      res.status(404);

      throw new Error(
        'Assigned technician not found or inactive'
      );
    }

    job.technician =
      technician._id;
  }

  const updated =
    await job.save();

  /**
   * =========================================================
   * SYNC SERVICE REQUEST
   * =========================================================
   */

  if (job.serviceRequest) {
    await ServiceRequest.findByIdAndUpdate(
      job.serviceRequest,
      {
        status: updated.status,
        assignedTechnician:
          updated.technician ||
          null,
      }
    );
  }

  /**
   * =========================================================
   * ACTIVITY LOGS
   * =========================================================
   */

  if (
    req.body.technician &&
    req.body.technician !==
      oldTechnician
  ) {
    await logActivity({
      company: req.user.company,
      entityType: 'Job',
      entityId: job._id,
      action:
        'ASSIGN_TECHNICIAN',
      message:
        'Technician reassigned',
    });
  }

  if (
    req.body.status &&
    req.body.status !== oldStatus
  ) {
    await logActivity({
      company: req.user.company,
      entityType: 'Job',
      entityId: job._id,
      action: 'UPDATE_STATUS',
      message: `Status changed from ${oldStatus} to ${job.status}`,
    });
  }

  res.json(updated);
});

/**
 * @desc    Fast status update
 * @route   PATCH /api/jobs/:id/status
 * @access  Technician / Dispatcher / Manager
 */
const updateJobStatus = asyncHandler(async (req, res) => {
  /**
   * =========================================================
   * ROLE VALIDATION
   * =========================================================
   */

  if (!canAccessJobs(req.user.role)) {
    res.status(403);

    throw new Error(
      "You are not authorized to update job status"
    );
  }

  const { status } = req.body;

  const query = {
    _id: req.params.id,
    company: req.user.company,
  };

  /**
   * =========================================================
   * TECHNICIAN ACCESS
   * =========================================================
   */

  if (req.user.role === "technician") {
    const technician = await Technician.findOne({
      user: req.user._id,
      company: req.user.company,
    });

    if (!technician) {
      res.status(403);

      throw new Error("Technician not found");
    }

    query.technician = technician._id;
  }

  /**
   * =========================================================
   * FETCH JOB
   * =========================================================
   */

  const job = await Job.findOne(query);

  if (!job) {
    res.status(404);

    throw new Error("Job not found");
  }

  const oldStatus = job.status;

  /**
   * =========================================================
   * UPDATE STATUS
   * =========================================================
   */

  job.status = status;

  const updated = await job.save();

  /**
   * =========================================================
   * SYNC SERVICE REQUEST
   * =========================================================
   */

  if (job.serviceRequest) {
    await ServiceRequest.findByIdAndUpdate(job.serviceRequest, {
      status,
    });
  }

  /**
   * =========================================================
   * ACTIVITY LOG
   * =========================================================
   */

  await logActivity({
    company: req.user.company,
    entityType: "Job",
    entityId: job._id,
    action: "UPDATE_JOB_STATUS",
    message: `Status changed from ${oldStatus} to ${status}`,
  });

  /**
   * =========================================================
   * NOTIFICATIONS
   * Only when updated by a technician
   * =========================================================
   */

  if (req.user.role === "technician") {
    // Notify managers & dispatchers
    const users = await User.find({
      company: req.user.company,
      role: {
        $in: ["manager", "dispatcher"],
      },
    }).select("_id");

    const notifications = users.map((user) =>
      createNotification({
        company: req.user.company,
        user: user._id,
        title: "Job Status Updated",
        message: `Job ${job._id} status changed from ${oldStatus} to ${status}.`,
        type: "job_status",
        referenceId: job._id,
      })
    );

    /**
     * Customer notification
     * Only if portal account exists
     */
    const customer = await Customer.findById(job.customer)
      .select("+password");

    if (customer?.password) {
      notifications.push(
        createNotification({
          company: req.user.company,
          customer: customer._id,
          title: "Job Status Updated",
          message: `Your service request is now ${status}.`,
          type: "job_status",
          referenceId: job._id,
        })
      );
    }

    await Promise.all(notifications);
  }

  res.json(updated);
});

// controllers/jobController.js

const getJobsByCustomer = asyncHandler(
  async (req, res) => {
    const { customerId } = req.params;
    console.log(customerId);

    const jobs = await Job.find({
      company: req.user.company,
      customer: customerId,
    })

      .populate(
        "customer",
        "name phone"
      )
      .sort({ createdAt: -1 });
      console.log(jobs);
    res.json(jobs);
  }
);

/**
 * @desc    Delete job
 * @route   DELETE /api/jobs/:id
 * @access  Dispatcher / Manager
 */
const deleteJob = asyncHandler(async (req, res) => {
  /**
   * =========================================================
   * ROLE VALIDATION
   * =========================================================
   */

  if (!canManageJobs(req.user.role)) {
    res.status(403);

    throw new Error(
      'You are not authorized to delete jobs'
    );
  }

  const job = await Job.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!job) {
    res.status(404);

    throw new Error('Job not found');
  }

  /**
   * =========================================================
   * REOPEN SERVICE REQUEST
   * =========================================================
   */

  if (job.serviceRequest) {
    await ServiceRequest.findByIdAndUpdate(
      job.serviceRequest,
      {
        status: 'new',
        assignmentStatus:
          'pending',
        assignedTechnician: null,
      }
    );
  }

  /**
   * =========================================================
   * DELETE JOB
   * =========================================================
   */

  await job.deleteOne();

  /**
   * =========================================================
   * ACTIVITY LOGS
   * =========================================================
   */

  await logActivity({
    company: req.user.company,
    entityType: 'Job',
    entityId: job._id,
    action: 'DELETE_JOB',
    message: 'Job deleted',
  });

  res.json({
    message: 'Job removed',
  });
});

export {
  acceptServiceRequest,
  createJob,
  getJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  getJobsByCustomer,
  deleteJob,
};