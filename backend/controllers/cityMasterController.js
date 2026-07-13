import asyncHandler from "../middleware/asyncHandler.js";
import CityMaster from "../models/CityMaster.js";

/**
 * @desc    Create new city master
 * @route   POST /api/city-master
 * @access  Private/Admin
 */
const createCityMaster = asyncHandler(async (req, res) => {
  console.log("\n================ CREATE CITY MASTER START ================\n");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { name, state, country } = req.body;

    // =========================
    // Validate name
    // =========================

    if (!name?.trim()) {
      res.status(400);
      throw new Error("City name is required");
    }

    if (!state?.trim()) {
      res.status(400);
      throw new Error("State is required");
    }

    const cityName = name.trim();
    const stateName = state.trim();
    const countryName = country?.trim() || "India";

    console.log("👉 City:", cityName);
    console.log("👉 State:", stateName);

    // =========================
    // Duplicate check
    // =========================

    const existingCity = await CityMaster.findOne({
      name: cityName,
      state: stateName,
      country: countryName,
    }).session(session);

    if (existingCity) {
      res.status(400);
      throw new Error("City already exists");
    }

    // =========================
    // Create City Master
    // =========================

    const cities = await CityMaster.create(
      [
        {
          name: cityName,
          state: stateName,
          country: countryName,
        },
      ],
      { session }
    );

    const city = cities[0];

    console.log("✅ City Master created:", city._id);

    // =========================
    // Create Default Area Master
    // =========================

    const areas = await AreaMaster.create(
      [
        {
          city: city._id,
          name: "Service Area",
        },
      ],
      { session }
    );

    const serviceArea = areas[0];

    console.log("✅ Default Area Master created:", serviceArea._id);

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        city,
        defaultArea: serviceArea,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
});

/**
 * @desc    Get all city masters
 * @route   GET /api/city-master
 * @access  Private/Admin
 */
const getCityMasters = asyncHandler(async (req, res) => {
  const cities = await CityMaster.find().sort({
    country: 1,
    state: 1,
    name: 1,
  });

  res.status(200).json({
    success: true,

    data: cities,
  });
});

/**
 * @desc    Get active cities
 * @route   GET /api/city-master/options
 * @access  Private/Admin
 */
const getCityMasterOptions = asyncHandler(async (req, res) => {
  const cities = await CityMaster.find({
    isActive: true,
  })
    .select("_id name state country")
    .sort({
      country: 1,

      state: 1,

      name: 1,
    });

  res.json(cities);
});

/**
 * @desc    Get city by id
 * @route   GET /api/city-master/:id
 * @access  Private/Admin
 */
const getCityMasterById = asyncHandler(async (req, res) => {
  const city = await CityMaster.findById(req.params.id);

  if (!city) {
    res.status(404);

    throw new Error("City not found");
  }

  res.status(200).json({
    success: true,

    data: city,
  });
});

/**
 * @desc    Update city master
 * @route   PUT /api/city-master/:id
 * @access  Private/Admin
 */
const updateCityMaster = asyncHandler(async (req, res) => {
  const { name, state, country, isActive } = req.body;

  const city = await CityMaster.findById(req.params.id);

  if (!city) {
    res.status(404);

    throw new Error("City not found");
  }

  const finalName = name?.trim() || city.name;

  const finalState = state?.trim() || city.state;

  const finalCountry = country?.trim() || city.country;

  // =========================
  // Duplicate validation
  // =========================

  const duplicate = await CityMaster.findOne({
    name: finalName,

    state: finalState,

    country: finalCountry,

    _id: {
      $ne: city._id,
    },
  });

  if (duplicate) {
    res.status(400);

    throw new Error("City already exists");
  }

  city.name = finalName;

  city.state = finalState;

  city.country = finalCountry;

  if (typeof isActive === "boolean") {
    city.isActive = isActive;
  }

  await city.save();

  res.status(200).json({
    success: true,

    data: city,
  });
});

/**
 * @desc    Toggle city status
 * @route   PATCH /api/city-master/:id/toggle-status
 * @access  Private/Admin
 */
const toggleCityStatus = asyncHandler(async (req, res) => {
  const city = await CityMaster.findById(req.params.id);

  if (!city) {
    res.status(404);

    throw new Error("City not found");
  }

  city.isActive = !city.isActive;

  await city.save();

  res.status(200).json({
    success: true,

    data: city,
  });
});

/**
 * @desc    Delete city master
 * @route   DELETE /api/city-master/:id
 * @access  Private/Admin
 */
const deleteCityMaster = asyncHandler(async (req, res) => {
  const city = await CityMaster.findByIdAndDelete(req.params.id);

  if (!city) {
    res.status(404);

    throw new Error("City not found");
  }

  res.status(200).json({
    success: true,

    message: "City deleted successfully",
  });
});

export {
  createCityMaster,
  getCityMasters,
  getCityMasterOptions,
  getCityMasterById,
  updateCityMaster,
  toggleCityStatus,
  deleteCityMaster,
};
