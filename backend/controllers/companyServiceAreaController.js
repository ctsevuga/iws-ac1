import asyncHandler from "../middleware/asyncHandler.js";

import CompanyServiceArea from "../models/companyServiceArea.js";
import Company from "../models/companyModel.js";
import CityMaster from "../models/cityMaster.js";
import AreaMaster from "../models/areaMaster.js";

/**
 * @desc    Create company service area mapping
 * @route   POST /api/company-service-area
 * @access  Private/Admin
 */
const createCompanyServiceArea = asyncHandler(async (req, res) => {
  console.log(
    "\n================ CREATE COMPANY SERVICE AREA START ================\n",
  );

  const { company, city, area } = req.body;

  // =========================
  // Validate inputs
  // =========================

  if (!company) {
    res.status(400);
    throw new Error("Company is required");
  }

  if (!city) {
    res.status(400);
    throw new Error("City is required");
  }

  if (!area) {
    res.status(400);
    throw new Error("Area is required");
  }

  // =========================
  // Validate Company
  // =========================

  const companyExists = await Company.findById(company);

  if (!companyExists) {
    res.status(404);
    throw new Error("Company not found");
  }

  // =========================
  // Validate City
  // =========================

  const cityExists = await CityMaster.findById(city);

  if (!cityExists) {
    res.status(404);
    throw new Error("City not found");
  }

  // =========================
  // Validate Area
  // =========================

  const areaExists = await AreaMaster.findOne({
    _id: area,
    city,
  });

  if (!areaExists) {
    res.status(400);
    throw new Error("Invalid area selected for city");
  }

  // =========================
  // Duplicate check
  // =========================

  const existing = await CompanyServiceArea.findOne({
    company,
    area,
  });

  if (existing) {
    res.status(400);
    throw new Error("Company already serves this area");
  }

  // =========================
  // Create mapping
  // =========================

  const serviceArea = await CompanyServiceArea.create({
    company,
    city,
    area,
  });

  const populated = await CompanyServiceArea.findById(serviceArea._id)
    .populate("company", "name slug")
    .populate("city", "name state country")
    .populate("area", "name");

  console.log("✅ Company service area created:", serviceArea._id);

  res.status(201).json({
    success: true,

    data: populated,
  });
});

/**
 * @desc    Get all service areas
 * @route   GET /api/company-service-area
 * @access  Private/Admin
 */
const getCompanyServiceAreas = asyncHandler(async (req, res) => {
  const { company, city, area } = req.query;

  console.log(req.query);

  const query = {};

  if (company) {
    query.company = company;
  }

  if (city) {
    query.city = city;
  }

  if (area) {
    query.area = area;
  }

  const mappings = await CompanyServiceArea.find(query)

    .populate("company", "name slug")

    .populate("city", "name state country")

    .populate("area", "name")

    .sort({
      createdAt: -1,
    });

  // console.log(mappings);

  res.status(200).json({
    success: true,

    data: mappings,
  });
});

/**
 * @desc    Get companies serving an area
 * @route   GET /api/company-service-area/area/:areaId
 * @access  Public/Private
 */
const getCompaniesByArea = asyncHandler(async (req, res) => {
  const { areaId } = req.params;

  const companies = await CompanyServiceArea.find({
    area: areaId,

    isActive: true,
  })

    .populate("company", "name slug logoUrl website");

  res.status(200).json({
    success: true,

    data: companies,
  });
});

/**
 * @desc    Get company service areas
 * @route   GET /api/company-service-area/company/:companyId
 * @access  Private/Admin
 */
const getCompanyAreas = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const areas = await CompanyServiceArea.find({
    company: companyId,

    isActive: true,
  })

    .populate("city", "name state country")

    .populate("area", "name")

    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    success: true,

    data: areas,
  });
});

/**
 * @desc    Update company service area
 * @route   PUT /api/company-service-area/:id
 * @access  Private/Admin
 */
const updateCompanyServiceArea = asyncHandler(async (req, res) => {
  const { city, area, isActive } = req.body;

  const mapping = await CompanyServiceArea.findById(req.params.id);

  if (!mapping) {
    res.status(404);

    throw new Error("Service area mapping not found");
  }

  if (area || city) {
    const finalCity = city || mapping.city;

    const finalArea = area || mapping.area;

    const areaExists = await AreaMaster.findOne({
      _id: finalArea,

      city: finalCity,
    });

    if (!areaExists) {
      res.status(400);

      throw new Error("Invalid area selected");
    }

    mapping.city = finalCity;

    mapping.area = finalArea;
  }

  if (typeof isActive === "boolean") {
    mapping.isActive = isActive;
  }

  await mapping.save();

  const updated = await CompanyServiceArea.findById(mapping._id)

    .populate("company", "name slug")

    .populate("city", "name state country")

    .populate("area", "name");

  res.status(200).json({
    success: true,

    data: updated,
  });
});

/**
 * @desc    Toggle service area status
 * @route   PATCH /api/company-service-area/:id/toggle-status
 * @access  Private/Admin
 */
const toggleCompanyServiceAreaStatus = asyncHandler(async (req, res) => {
  const mapping = await CompanyServiceArea.findById(req.params.id);

  if (!mapping) {
    res.status(404);

    throw new Error("Service area mapping not found");
  }

  mapping.isActive = !mapping.isActive;

  await mapping.save();

  res.status(200).json({
    success: true,

    data: mapping,
  });
});

/**
 * @desc    Delete service area mapping
 * @route   DELETE /api/company-service-area/:id
 * @access  Private/Admin
 */
const deleteCompanyServiceArea = asyncHandler(async (req, res) => {
  const mapping = await CompanyServiceArea.findByIdAndDelete(req.params.id);

  if (!mapping) {
    res.status(404);

    throw new Error("Service area mapping not found");
  }

  res.status(200).json({
    success: true,

    message: "Service area removed successfully",
  });
});

export {
  createCompanyServiceArea,
  getCompanyServiceAreas,
  getCompaniesByArea,
  getCompanyAreas,
  updateCompanyServiceArea,
  toggleCompanyServiceAreaStatus,
  deleteCompanyServiceArea,
};
