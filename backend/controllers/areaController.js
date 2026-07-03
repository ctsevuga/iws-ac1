// controllers/areaController.js

import asyncHandler from "../middleware/asyncHandler.js";
import Area from "../models/areaModel.js";
import City from "../models/cityModel.js";
import Customer from "../models/customerModel.js";
import Technician from "../models/technicianModel.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * @desc    Create new area
 * @route   POST /api/areas
 * @access  Private
 */

const createArea = asyncHandler(async (req, res) => {
  console.log("\n================ CREATE AREA START ================\n");

  let { name, city } = req.body;

  // =========================
  // Company ID
  // =========================
  const companyId =
    req.user?.company?._id?.toString() ||
    req.user?.company?.toString();

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  // =========================
  // Validate name
  // =========================
  if (!name?.trim()) {
    res.status(400);
    throw new Error("Area name is required");
  }

  name = name.trim();

  // =========================
  // Validate city ObjectId
  // =========================
  if (!city) {
    res.status(400);
    throw new Error("City is required");
  }

  const cityId = city.toString();

  console.log("👉 companyId:", companyId);
  console.log("👉 cityId:", cityId);
  console.log("👉 area name:", name);

  // =========================
  // Validate city belongs to company
  // =========================
  const cityExists = await City.findOne({
    _id: cityId,
    company: companyId,
  });

  if (!cityExists) {
    res.status(400);
    throw new Error("Invalid city selected");
  }

  // =========================
  // Duplicate check
  // =========================
  const existingArea = await Area.findOne({
    company: companyId,
    city: cityId,
    name,
  });

  if (existingArea) {
    res.status(400);
    throw new Error("Area already exists in this city");
  }

  // =========================
  // Create Area
  // =========================
  const area = await Area.create({
    company: companyId,
    city: cityId,
    name,
  });

  console.log("✅ Area created:", area._id);

  // =========================
  // Populate BEFORE sending response
  // =========================
  const populatedArea = await Area.findById(area._id)
    .populate("city", "name state country");

  console.log("📦 Populated Area:", populatedArea);

  console.log("\n================ CREATE AREA END ================\n");

  res.status(201).json({
    success: true,
    data: populatedArea,
  });
});

const assignAreaToCity = asyncHandler(async (req, res) => {
  const { areaId } = req.params;
  const { city } = req.body;

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  if (!city) {
    res.status(400);
    throw new Error("City is required");
  }

  // Verify city exists
  const cityExists = await City.findOne({
    _id: city,
    company: companyId,
  });

  if (!cityExists) {
    res.status(400);
    throw new Error("Invalid city selected");
  }

  // Find area
  const area = await Area.findOne({
    _id: areaId,
    company: companyId,
  });

  if (!area) {
    res.status(404);
    throw new Error("Area not found");
  }

  // Check duplicate in target city
  const duplicateArea = await Area.findOne({
    company: companyId,
    city,
    name: area.name,
    _id: { $ne: areaId },
  });

  if (duplicateArea) {
    res.status(400);
    throw new Error(`Area '${area.name}' already exists in ${cityExists.name}`);
  }

  area.city = city;
  await area.save();

  const updatedArea = await Area.findById(area._id).populate(
    "city",
    "name state country",
  );

  res.status(200).json({
    success: true,
    message: "Area assigned to city successfully",
    data: updatedArea,
  });
});

const getCityAreas = asyncHandler(async (req, res) => {
  const { cityId } = req.params;

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  const city = await City.findOne({
    _id: cityId,
    company: companyId,
  });

  if (!city) {
    return res.status(404).json({
      success: false,
      message: "City not found",
    });
  }

  const areas = await Area.find({
    company: companyId,
    city: cityId,
  }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    city,
    areas,
  });
});

const getCompanyCities = asyncHandler(async (req, res) => {
  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  const cities = await City.find({ company: companyId }, { name: 1 }).sort({
    name: 1,
  });

  res.status(200).json({
    success: true,
    data: cities,
  });
});

/**
 * @desc    Get all areas
 * @route   GET /api/areas
 * @access  Private
 */
const getAreas = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  console.log("👉 companyId:", companyId);

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  const skip = (Number(page) - 1) * Number(limit);

  // =========================
  // Base filter
  // =========================
  const query = {
    company: companyId,
  };

  // =========================
  // SEARCH LOGIC (UPDATED)
  // =========================
  let searchQuery = {};

  if (search) {
    searchQuery = {
      name: { $regex: search, $options: "i" },
    };
  }

  // =========================
  // FETCH AREAS
  // =========================
  const areas = await Area.find({
  ...query,
  ...searchQuery,
})
  .populate({
    path: "city",
    select: "name state country",
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(Number(limit));

  // =========================
  // TOTAL COUNT
  // =========================
  const total = await Area.countDocuments({
    ...query,
    ...searchQuery,
  });

  console.log("👉 Areas found:", areas.length);

  res.json({
    success: true,
    areas: areas.map((area) => ({
      _id: area._id,
      name: area.name,
      city: area.city, // fully populated
      createdAt: area.createdAt,
    })),
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

/**
 * @desc    Get area by ID
 * @route   GET /api/areas/:id
 * @access  Private
 */
const getAreaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  console.log("👉 companyId:", companyId);
  console.log("👉 areaId:", id);

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  // =========================
  // Fetch Area with City
  // =========================
  const area = await Area.findOne({
    _id: id,
    company: companyId,
  }).populate("city", "name state country");

  if (!area) {
    res.status(404);
    throw new Error("Area not found");
  }

  console.log("👉 Area found:", area.name);

  res.status(200).json({
    success: true,
    data: {
      _id: area._id,
      name: area.name,
      city: area.city, // fully populated
      createdAt: area.createdAt,
      updatedAt: area.updatedAt,
    },
  });
});

/**
 * @desc    Update area
 * @route   PUT /api/areas/:id
 * @access  Private
 */
const updateArea = asyncHandler(async (req, res) => {
  const { name, city } = req.body;

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  console.log("👉 companyId:", companyId);
  console.log("👉 areaId:", req.params.id);

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  // =========================
  // Find area
  // =========================
  const area = await Area.findOne({
    _id: req.params.id,
    company: companyId,
  });

  if (!area) {
    res.status(404);
    throw new Error("Area not found");
  }

  console.log("👉 Existing area:", area.name);

  let newCityId = area.city; // default keep same city

  // =========================
  // Validate city (if provided)
  // =========================
  if (city) {
    const cityDoc = await City.findOne({
      _id: city,
      company: companyId,
    });

    if (!cityDoc) {
      res.status(400);
      throw new Error("Invalid city selected");
    }

    newCityId = city;
  }

  // =========================
  // Validate duplicate (city + name + company)
  // =========================
  const finalName = name?.trim() || area.name;

  if (finalName !== area.name || String(newCityId) !== String(area.city)) {
    const existingArea = await Area.findOne({
      company: companyId,
      city: newCityId,
      name: finalName,
      _id: { $ne: area._id },
    });

    if (existingArea) {
      res.status(400);
      throw new Error(`Area '${finalName}' already exists in selected city`);
    }
  }

  const oldName = area.name;

  // =========================
  // Apply updates
  // =========================
  if (name) area.name = name.trim();
  area.city = newCityId;

  const updatedArea = await area.save();

  // =========================
  // Activity log
  // =========================
  await logActivity({
    company: companyId,
    entityType: "Area",
    entityId: area._id,
    action: "UPDATE_AREA",
    message: `Area updated (${oldName} → ${updatedArea.name})`,
  });

  console.log("✅ Area updated:", updatedArea._id);

  // =========================
  // Return populated response
  // =========================
  const populated = await Area.findById(updatedArea._id).populate(
    "city",
    "name state country",
  );

  res.json({
    success: true,
    data: populated,
  });
});

const getAreaOptions = asyncHandler(async (req, res) => {
  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  console.log("👉 companyId:", companyId);

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  const areas = await Area.find({
    company: companyId,
  })
    .select("_id name city")
    .populate("city", "name state")
    .sort({ name: 1 })
    .lean();

  console.log("👉 Areas found:", areas.length);

  const formatted = areas.map((area) => ({
    _id: area._id,
    name: area.name,
    city: area.city
      ? {
          _id: area.city._id,
          name: area.city.name,
          state: area.city.state,
        }
      : null,
  }));

  res.json({
    success: true,
    data: formatted,
  });
});


/**
 * @desc    Delete area
 * @route   DELETE /api/areas/:id
 * @access  Private
 */
const deleteArea = asyncHandler(async (req, res) => {
  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  console.log("👉 companyId:", companyId);
  console.log("👉 areaId:", req.params.id);

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  // =========================
  // Find area
  // =========================
  const area = await Area.findOne({
    _id: req.params.id,
    company: companyId,
  }).populate("city", "name state");

  if (!area) {
    res.status(404);
    throw new Error("Area not found");
  }

  console.log("👉 Deleting area:", area.name);

  // =========================
  // Check customer usage
  // =========================
  const customersUsingArea = await Customer.countDocuments({
    company: companyId,
    area: area._id,
  });

  if (customersUsingArea > 0) {
    res.status(400);
    throw new Error("Cannot delete area because customers are assigned to it");
  }

  // =========================
  // Check technician usage
  // =========================
  const techniciansUsingArea = await Technician.countDocuments({
    company: companyId,
    areas: area._id,
  });

  if (techniciansUsingArea > 0) {
    res.status(400);
    throw new Error(
      "Cannot delete area because technicians are assigned to it",
    );
  }

  // =========================
  // Delete area
  // =========================
  await area.deleteOne();

  console.log("✅ Area deleted:", area._id);

  // =========================
  // Activity log
  // =========================
  await logActivity({
    company: companyId,
    entityType: "Area",
    entityId: area._id,
    action: "DELETE_AREA",
    message: `Area ${area.name} (${area.city?.name || "Unknown City"}) deleted`,
  });

  res.json({
    success: true,
    message: "Area deleted successfully",
  });
});

export {
  createArea,
  assignAreaToCity,
  getCityAreas,
  getCompanyCities,
  getAreas,
  getAreaById,
  updateArea,
  getAreaOptions,
  deleteArea,
};
