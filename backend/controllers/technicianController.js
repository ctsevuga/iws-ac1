import asyncHandler from "../middleware/asyncHandler.js";
import Technician from "../models/technicianModel.js";
import Job from "../models/jobModel.js";
import Area from "../models/areaModel.js";
import User from "../models/userModel.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Manager + Dispatcher can manage technicians
 */
const canManageTechnicians = (user) => {
  return ["manager", "dispatcher"].includes(user.role);
};

/**
 * Technician can access only own technician record
 */
const isOwnTechnicianRecord = (req, technician) => {
  return (
    req.user.role === "technician" &&
    technician.user?.toString() === req.user._id.toString()
  );
};

/**
 * =========================================================
 * @desc    Create new technician
 * @route   POST /api/technicians
 * =========================================================
 */
const createTechnician = asyncHandler(async (req, res) => {
  if (!canManageTechnicians(req.user)) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const {
    user,
    skills,
    isAvailable,
    currentLocation,
    areas,
  } = req.body;

  /**
   * Validate linked user
   */
  const linkedUser = await User.findOne({
    _id: user,
    company: req.user.company,
    role: "technician",
  });

  if (!linkedUser) {
    res.status(400);
    throw new Error(
      "Invalid technician user account"
    );
  }

  /**
   * Prevent duplicate technician profile
   */
  const existingUserTech = await Technician.findOne({
    user,
  });

  if (existingUserTech) {
    res.status(400);
    throw new Error(
      "Technician profile already exists for this user"
    );
  }

  /**
   * Validate areas
   */
  if (areas && areas.length > 0) {
    const validAreas = await Area.countDocuments({
      _id: { $in: areas },
      company: req.user.company,
    });

    if (validAreas !== areas.length) {
      res.status(400);
      throw new Error(
        "One or more areas are invalid"
      );
    }
  }

  /**
   * Create technician
   */
  const technician = await Technician.create({
    company: req.user.company,
    user,
    name: linkedUser.name,
    email: linkedUser.email,
    skills: skills || [],
    isAvailable:
      isAvailable !== undefined
        ? isAvailable
        : true,
    currentLocation,
    areas: areas || [],
  });

  /**
   * Link technician profile back to user
   */
  linkedUser.technicianProfile =
    technician._id;

  await linkedUser.save();

  /**
   * Audit log
   */
  await logActivity({
    company: req.user.company,
    entityType: "Technician",
    entityId: technician._id,
    action: "CREATE_TECHNICIAN",
    message: `Technician ${linkedUser.name} created`,
  });

  /**
   * Populate area + city hierarchy
   */
  const populated = await Technician.findById(
    technician._id
  )
    .populate({
      path: "areas",
      populate: {
        path: "city",
        select: "name state country",
      },
    })
    .populate({
      path: "user",
      select:
        "name email phone role isActive",
    });

  res.status(201).json(populated);
});

/**
 * =========================================================
 * @desc    Get all technicians
 * @route   GET /api/technicians
 * =========================================================
 */
const getTechnicians = asyncHandler(async (req, res) => {
  if (!canManageTechnicians(req.user)) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const {
    skill,
    isAvailable,
    area,
    page = 1,
    limit = 20,
  } = req.query;

  const query = {
    company: req.user.company,
  };

  if (skill) {
    query.skills = skill;
  }

  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === "true";
  }

  if (area) {
    query.areas = area;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const technicians = await Technician.find(query)
    .populate({
      path: "areas",
      populate: {
        path: "city",
        select: "name state country",
      },
    })
    .populate("user", "name email role phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const count = await Technician.countDocuments(query);

  res.json({
    technicians,
    page: Number(page),
    pages: Math.ceil(count / Number(limit)),
    total: count,
  });
});

/**
 * =========================================================
 * @desc    Get technician by ID
 * @route   GET /api/technicians/:id
 * =========================================================
 */
const getTechnicianById = asyncHandler(
  async (req, res) => {
    const technician = await Technician.findOne({
      _id: req.params.id,
      company: req.user.company,
    })
      .populate({
        path: "areas",
        populate: {
          path: "city",
          select: "name state country",
        },
      })
      .populate("user", "name email role phone");

    if (!technician) {
      res.status(404);
      throw new Error("Technician not found");
    }

    /**
     * Manager / Dispatcher
     */
    if (canManageTechnicians(req.user)) {
      return res.json(technician);
    }

    /**
     * Technician self-access
     */
    if (isOwnTechnicianRecord(req, technician)) {
      return res.json(technician);
    }

    res.status(403);
    throw new Error("Not authorized");
  }
);

/**
 * =========================================================
 * @desc    Update technician
 * @route   PUT /api/technicians/:id
 * =========================================================
 */
const updateTechnician = asyncHandler(
  async (req, res) => {
    if (
      !canManageTechnicians(req.user)
    ) {
      res.status(403);
      throw new Error(
        "Not authorized"
      );
    }

    const technician =
      await Technician.findOne({
        _id: req.params.id,
        company: req.user.company,
      });

    if (!technician) {
      res.status(404);
      throw new Error(
        "Technician not found"
      );
    }

    /**
     * Validate linked user
     */
    if (req.body.user) {
      const linkedUser =
        await User.findOne({
          _id: req.body.user,
          company:
            req.user.company,
          role: "technician",
        });

      if (!linkedUser) {
        res.status(400);
        throw new Error(
          "Invalid technician user account"
        );
      }

      /**
       * Prevent assigning same user
       * to multiple technician records
       */
      const existingTech =
        await Technician.findOne({
          user: req.body.user,
          _id: {
            $ne: technician._id,
          },
        });

      if (existingTech) {
        res.status(400);
        throw new Error(
          "User already assigned to another technician profile"
        );
      }
    }

    /**
     * Validate areas
     */
    if (req.body.areas) {
      const validAreas =
        await Area.countDocuments({
          _id: {
            $in: req.body.areas,
          },
          company:
            req.user.company,
        });

      if (
        validAreas !==
        req.body.areas.length
      ) {
        res.status(400);
        throw new Error(
          "One or more areas are invalid"
        );
      }
    }

    /**
     * Validate duplicate phone
     */
    if (
      req.body.phone &&
      req.body.phone !==
        technician.phone
    ) {
      const existingPhone =
        await Technician.findOne({
          company:
            req.user.company,
          phone: req.body.phone,
          _id: {
            $ne: technician._id,
          },
        });

      if (existingPhone) {
        res.status(400);
        throw new Error(
          "Phone number already in use"
        );
      }
    }

    technician.user =
      req.body.user ??
      technician.user;

    technician.name =
      req.body.name ??
      technician.name;

    technician.phone =
      req.body.phone ??
      technician.phone;

    technician.email =
      req.body.email ??
      technician.email;

    technician.skills =
      req.body.skills ??
      technician.skills;

    technician.isAvailable =
      req.body.isAvailable !==
      undefined
        ? req.body.isAvailable
        : technician.isAvailable;

    technician.currentLocation =
      req.body.currentLocation ??
      technician.currentLocation;

    technician.areas =
      req.body.areas ??
      technician.areas;

    const updated =
      await technician.save();

    await logActivity({
      company: req.user.company,
      entityType: "Technician",
      entityId: technician._id,
      action: "UPDATE_TECHNICIAN",
      message: `Technician ${updated.name} updated`,
    });

    const populated =
      await updated.populate([
        {
          path: "areas",
        },
        {
          path: "user",
          select:
            "name email role",
        },
      ]);

    res.json(populated);
  }
);

/**
 * =========================================================
 * @desc    Update technician availability
 * @route   PATCH /api/technicians/:id/availability
 * =========================================================
 */
const updateTechnicianAvailability =
  asyncHandler(async (req, res) => {
    const { isAvailable } = req.body;

    const technician =
      await Technician.findOne({
        _id: req.params.id,
        company: req.user.company,
      });

    if (!technician) {
      res.status(404);
      throw new Error(
        "Technician not found"
      );
    }

    /**
     * Manager / Dispatcher
     * OR technician self-update
     */
    if (
      !canManageTechnicians(
        req.user
      ) &&
      !isOwnTechnicianRecord(
        req,
        technician
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized"
      );
    }

    const oldValue =
      technician.isAvailable;

    technician.isAvailable =
      isAvailable;

    const updated =
      await technician.save();

    await logActivity({
      company: req.user.company,
      entityType: "Technician",
      entityId: technician._id,
      action:
        "UPDATE_AVAILABILITY",
      message: `Availability changed from ${oldValue} to ${isAvailable}`,
    });

    res.json(updated);
  });

/**
 * =========================================================
 * @desc    Update technician location
 * @route   PATCH /api/technicians/:id/location
 * =========================================================
 */
const updateTechnicianLocation =
  asyncHandler(async (req, res) => {
    const { lat, lng } = req.body;

    const technician =
      await Technician.findOne({
        _id: req.params.id,
        company: req.user.company,
      });

    if (!technician) {
      res.status(404);
      throw new Error(
        "Technician not found"
      );
    }

    /**
     * Manager / Dispatcher
     * OR technician self-update
     */
    if (
      !canManageTechnicians(
        req.user
      ) &&
      !isOwnTechnicianRecord(
        req,
        technician
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized"
      );
    }

    technician.currentLocation = {
      lat,
      lng,
      updatedAt: new Date(),
    };

    const updated =
      await technician.save();

    await logActivity({
      company: req.user.company,
      entityType: "Technician",
      entityId: technician._id,
      action: "UPDATE_LOCATION",
      message: `Technician location updated`,
    });

    res.json(updated);
  });

/**
 * =========================================================
 * @desc    Delete technician
 * @route   DELETE /api/technicians/:id
 * =========================================================
 */
const deleteTechnician = asyncHandler(
  async (req, res) => {
    if (
      !canManageTechnicians(
        req.user
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized"
      );
    }

    const technician =
      await Technician.findOne({
        _id: req.params.id,
        company: req.user.company,
      });

    if (!technician) {
      res.status(404);
      throw new Error(
        "Technician not found"
      );
    }

    /**
     * Prevent deleting active technicians
     */
    const assignedJobs =
      await Job.countDocuments({
        company:
          req.user.company,
        technician:
          technician._id,
        status: {
          $in: [
            "assigned",
            "in_progress",
          ],
        },
      });

    if (assignedJobs > 0) {
      res.status(400);
      throw new Error(
        "Cannot delete technician with active jobs"
      );
    }

    await technician.deleteOne();

    await logActivity({
      company: req.user.company,
      entityType: "Technician",
      entityId: technician._id,
      action:
        "DELETE_TECHNICIAN",
      message: `Technician ${technician.name} removed`,
    });

    res.json({
      message:
        "Technician removed",
    });
  });

export {
  createTechnician,
  getTechnicians,
  getTechnicianById,
  updateTechnician,
  updateTechnicianAvailability,
  updateTechnicianLocation,
  deleteTechnician,
};