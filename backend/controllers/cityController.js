// controllers/cityController.js

import asyncHandler from "../middleware/asyncHandler.js";
import City from "../models/cityModel.js";
import Area from "../models/areaModel.js";
import CityMaster from "../models/cityMaster.js";
import { logActivity } from "../utils/activityLogger.js";

/* -------------------------------------------------------------------------- */
/*                                CREATE CITY                                 */
/* -------------------------------------------------------------------------- */

const createCity = asyncHandler(async (req, res) => {
  let {
    cityMaster,
    name,
    state,
    country,
  } = req.body;


  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;


  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }


  if (!cityMaster) {
    res.status(400);
    throw new Error("City master reference is required");
  }


  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("City name is required");
  }


  name = name.trim();
  state = state?.trim();
  country = country?.trim() || "India";


  // Verify master city exists
  const masterCity = await CityMaster.findById(cityMaster);


  if (!masterCity) {
    res.status(404);
    throw new Error("Master city not found");
  }



  // Duplicate check
  // company + cityMaster is the reliable unique check
  const existingCity = await City.findOne({
    company: companyId,
    cityMaster,
  });


  if (existingCity) {
    res.status(400);
    throw new Error("City already assigned to company");
  }



  const city = await City.create({

    company: companyId,

    cityMaster,

    name,

    state,

    country,

  });



  await logActivity({

    company: companyId,

    entityType: "City",

    entityId: city._id,

    action: "CREATE_CITY",

    message: `City ${city.name} assigned to company`,

  });



  res.status(201).json({

    success: true,

    data: city,

  });

});

/* -------------------------------------------------------------------------- */
/*                                GET CITIES                                  */
/* -------------------------------------------------------------------------- */

const getCities = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const query = {
    company: companyId,
  };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const cities = await City.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await City.countDocuments(query);

  res.json({
    success: true,
    data: cities,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

/* -------------------------------------------------------------------------- */
/*                              GET CITY BY ID                                */
/* -------------------------------------------------------------------------- */

const getCityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const companyId =
    req.user?.company?.toString?.() ||
    req.user?.company;

  const city = await City.findOne({
    _id: id,
    company: companyId,
  });

  if (!city) {
    res.status(404);
    throw new Error("City not found");
  }

  res.json({
    success: true,
    data: city,
  });
});

/* -------------------------------------------------------------------------- */
/*                               UPDATE CITY                                  */
/* -------------------------------------------------------------------------- */

const updateCity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { name, state, country } = req.body;

  const companyId =
    req.user?.company?.toString?.() ||
    req.user?.company;

  const city = await City.findOne({
    _id: id,
    company: companyId,
  });

  if (!city) {
    res.status(404);
    throw new Error("City not found");
  }

  const newName = name?.trim() || city.name;
  const newState = state?.trim() || city.state;

  // Duplicate check
  if (newName !== city.name || newState !== city.state) {
    const duplicate = await City.findOne({
      company: companyId,
      name: newName,
      state: newState,
      _id: { $ne: id },
    });

    if (duplicate) {
      res.status(400);
      throw new Error("Another city already exists with same name/state");
    }
  }

  city.name = newName;
  city.state = newState;
  city.country = country?.trim() || city.country;

  const updated = await city.save();

  await logActivity({
    company: companyId,
    entityType: "City",
    entityId: city._id,
    action: "UPDATE_CITY",
    message: `City updated to ${updated.name}`,
  });

  res.json({
    success: true,
    data: updated,
  });
});

/* -------------------------------------------------------------------------- */
/*                               DELETE CITY                                  */
/* -------------------------------------------------------------------------- */

const deleteCity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const companyId =
    req.user?.company?.toString?.() ||
    req.user?.company;

  const city = await City.findOne({
    _id: id,
    company: companyId,
  });

  if (!city) {
    res.status(404);
    throw new Error("City not found");
  }

  // Prevent deletion if areas exist
  const areasUsingCity = await Area.countDocuments({
    company: companyId,
    city: city._id,
  });

  if (areasUsingCity > 0) {
    res.status(400);
    throw new Error("Cannot delete city with assigned areas");
  }

  await city.deleteOne();

  await logActivity({
    company: companyId,
    entityType: "City",
    entityId: city._id,
    action: "DELETE_CITY",
    message: `City ${city.name} deleted`,
  });

  res.json({
    success: true,
    message: "City deleted successfully",
  });
});

/* -------------------------------------------------------------------------- */
/*                             CITY OPTIONS (UI)                              */
/* -------------------------------------------------------------------------- */

const getCityOptions = asyncHandler(async (req, res) => {
  console.log("CITY OPTIONS HIT");

  const companyId =
    req.user?.company?._id?.toString() ||
    req.user?.company?.toString();

  console.log("COMPANY ID:", companyId);

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found in request");
  }

  const cities = await City.find(
    { company: companyId },
    { name: 1, state: 1 }
  ).sort({ name: 1 });

  console.log("CITY ARRAY IS", cities);

  res.json({
    success: true,
    data: cities || [],
  });
});



/* -------------------------------------------------------------------------- */
/*                                EXPORTS                                     */
/* -------------------------------------------------------------------------- */

export {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  getCityOptions,
  
};