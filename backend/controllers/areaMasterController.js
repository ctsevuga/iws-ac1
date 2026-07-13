import asyncHandler from "../middleware/asyncHandler.js";
import AreaMaster from "../models/areaMaster.js";
import CityMaster from "../models/cityMaster.js";

/**
 * @desc    Create new area master
 * @route   POST /api/area-master
 * @access  Private/Admin
 */
const createAreaMaster = asyncHandler(async (req, res) => {
  console.log("\n================ CREATE AREA MASTER START ================\n");

  let { name, city } = req.body;

  // =========================
  // Validate name
  // =========================

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Area name is required");
  }

  name = name.trim();

  // =========================
  // Validate city
  // =========================

  if (!city) {
    res.status(400);
    throw new Error("City is required");
  }

  console.log("👉 cityId:", city);
  console.log("👉 area name:", name);

  const cityExists = await CityMaster.findById(city);

  if (!cityExists) {
    res.status(400);
    throw new Error("Invalid city selected");
  }

  // =========================
  // Duplicate check
  // =========================

  const existingArea = await AreaMaster.findOne({
    city,
    name,
  });

  if (existingArea) {
    res.status(400);
    throw new Error("Area already exists in this city");
  }

  // =========================
  // Create Area
  // =========================

  const area = await AreaMaster.create({
    city,
    name,
  });

  const populatedArea = await AreaMaster.findById(area._id).populate(
    "city",
    "name state country",
  );

  console.log("✅ Area Master created:", area._id);

  res.status(201).json({
    success: true,
    data: populatedArea,
  });
});

/**
 * @desc    Get all area masters
 * @route   GET /api/area-master
 * @access  Private/Admin
 */
const getAreaMasters = asyncHandler(async (req, res) => {
  const { search, city, page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const query = {};

  if (city) {
    query.city = city;
  }

  if (search) {
    query.name = {
      $regex: search,
      $options: "i",
    };
  }

  const areas = await AreaMaster.find(query)
    .populate("city", "name state country")
    .sort({
      name: 1,
    })
    .skip(skip)
    .limit(Number(limit));

  const total = await AreaMaster.countDocuments(query);

  res.json({
    success: true,

    areas,

    page: Number(page),

    pages: Math.ceil(total / Number(limit)),

    total,
  });
});

/**
 * @desc    Get active areas
 * @route   GET /api/area-master/options
 * @access  Private/Admin
 */
const getAreaMasterOptions = asyncHandler(async (req, res) => {
  const areas = await AreaMaster.find({
    isActive: true,
  })
    .select("_id name city")
    .populate("city", "name state")
    .sort({
      name: 1,
    });

  res.json(areas);
});

/**
 * @desc    Get areas by city
 * @route   GET /api/area-master/city/:cityId
 * @access  Private/Admin
 */
const getCityAreaMasters = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  
  const city = await CityMaster.findById(cityId);

  if (!city) {
    res.status(404);

    throw new Error("City not found");
  }

  const areas = await AreaMaster.find({
    city: cityId,

    isActive: true,
  }).sort({
    name: 1,
  });

  res.json(areas);
});

/**
 * @desc    Get area by id
 * @route   GET /api/area-master/:id
 * @access  Private/Admin
 */
const getAreaMasterById = asyncHandler(async (req, res) => {
  const area = await AreaMaster.findById(req.params.id).populate(
    "city",
    "name state country",
  );

  if (!area) {
    res.status(404);

    throw new Error("Area not found");
  }

  res.json({
    success: true,

    data: area,
  });
});

/**
 * @desc    Update area master
 * @route   PUT /api/area-master/:id
 * @access  Private/Admin
 */
const updateAreaMaster = asyncHandler(async (req, res) => {
  const { name, city, isActive } = req.body;

  const area = await AreaMaster.findById(req.params.id);

  if (!area) {
    res.status(404);

    throw new Error("Area not found");
  }

  if (city) {
    const cityExists = await CityMaster.findById(city);

    if (!cityExists) {
      res.status(400);

      throw new Error("Invalid city selected");
    }
  }

  const finalCity = city || area.city;

  const finalName = name?.trim() || area.name;

  const duplicate = await AreaMaster.findOne({
    city: finalCity,

    name: finalName,

    _id: {
      $ne: area._id,
    },
  });

  if (duplicate) {
    res.status(400);

    throw new Error("Area already exists in this city");
  }

  area.name = finalName;

  area.city = finalCity;

  if (typeof isActive === "boolean") {
    area.isActive = isActive;
  }

  await area.save();

  const updated = await AreaMaster.findById(area._id).populate(
    "city",
    "name state country",
  );

  res.json({
    success: true,

    data: updated,
  });
});

/**
 * @desc    Toggle area status
 * @route   PATCH /api/area-master/:id/toggle-status
 * @access  Private/Admin
 */
const toggleAreaMasterStatus = asyncHandler(async (req, res) => {
  const area = await AreaMaster.findById(req.params.id);

  if (!area) {
    res.status(404);

    throw new Error("Area not found");
  }

  area.isActive = !area.isActive;

  await area.save();

  res.json({
    success: true,

    data: area,
  });
});

/**
 * @desc    Delete area master
 * @route   DELETE /api/area-master/:id
 * @access  Private/Admin
 */
const deleteAreaMaster = asyncHandler(async (req, res) => {
  const area = await AreaMaster.findByIdAndDelete(req.params.id);

  if (!area) {
    res.status(404);

    throw new Error("Area not found");
  }

  res.json({
    success: true,

    message: "Area deleted successfully",
  });
});

export {
  createAreaMaster,
  getAreaMasters,
  getAreaMasterOptions,
  getCityAreaMasters,
  getAreaMasterById,
  updateAreaMaster,
  toggleAreaMasterStatus,
  deleteAreaMaster,
};
