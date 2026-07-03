import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Customer from "../models/customerModel.js";
import City from "../models/cityModel.js";
import Area from "../models/areaModel.js";
import jwt from "jsonwebtoken";
import { logActivity } from "../utils/activityLogger.js";

/**
 * =====================================================
 * TOKEN GENERATOR
 * =====================================================
 */
const generateCustomerToken = (res, customerId) => {
  const token = jwt.sign(
    { customerId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.cookie("customerJwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

/**
 * =====================================================
 * REGISTER CUSTOMER (REQUIRES TENANT)
 * =====================================================
 */
const registerCustomer = asyncHandler(async (req, res) => {
  const company = req.company;

  if (!company) {
    res.status(400);
    throw new Error("Invalid company context");
  }

  const {
    name,
    phone,
    password,
    email,
    address,
    city,
    area,
  } = req.body;

  // =====================================
  // Basic Validation
  // =====================================

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Name is required");
  }

  if (!phone?.trim()) {
    res.status(400);
    throw new Error("Phone number is required");
  }

  if (!password || password.trim().length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  // =====================================
  // Normalize Phone
  // =====================================

  const normalizedPhone = phone
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .trim();

  // =====================================
  // Validate City & Area
  // =====================================

  let selectedCity = null;
  let selectedArea = null;

  if (city) {
    selectedCity = await City.findOne({
      _id: city,
      company: company._id,
    });

    if (!selectedCity) {
      res.status(400);
      throw new Error("Invalid city");
    }
  }

  if (area) {
    selectedArea = await Area.findOne({
      _id: area,
      company: company._id,
    });

    if (!selectedArea) {
      res.status(400);
      throw new Error("Invalid area");
    }

    if (
      selectedCity &&
      String(selectedArea.city) !== String(selectedCity._id)
    ) {
      res.status(400);
      throw new Error("Area does not belong to selected city");
    }
  }

  // =====================================
  // Check Existing Customer
  // =====================================

  const existingCustomer = await Customer.findOne({
    company: company._id,
    phone: normalizedPhone,
  });

  if (existingCustomer) {
    if (!existingCustomer.isActive) {
      res.status(403);
      throw new Error("Customer account is inactive");
    }

    res.status(409);
    throw new Error(
      "An account with this phone number already exists. Please use the Change Password or Forgot Password option to access your account."
    );
  }

  // =====================================
  // Create New Customer
  // =====================================

  const customer = await Customer.create({
    company: company._id,
    name: name.trim(),
    phone: normalizedPhone,
    email,
    password,
    address,
    area: selectedArea?._id,
    portalAccessEnabled: true,
    registrationSource: "self",
    lastLoginAt: new Date(),
    isActive: true,
  });

  generateCustomerToken(res, customer._id);

  await logActivity({
    company: company._id,
    entityType: "Customer",
    entityId: customer._id,
    action: "CUSTOMER_REGISTER",
    message: `Customer ${customer.name} registered via ${company.slug}`,
  });

  res.status(201).json({
    _id: customer._id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    area: customer.area,
  });
});

const forgotCustomerPassword = asyncHandler(async (req, res) => {
  const company = req.company;

  if (!company) {
    res.status(400);
    throw new Error("Invalid company context");
  }

  const { phone, password } = req.body;

  // =====================================
  // Basic Validation
  // =====================================

  if (!phone?.trim()) {
    res.status(400);
    throw new Error("Phone number is required");
  }

  if (!password || password.trim().length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  // =====================================
  // Normalize Phone (Indian Format)
  // =====================================

  let normalizedPhone = phone
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .trim();

  // Remove +91
  if (normalizedPhone.startsWith("+91")) {
    normalizedPhone = normalizedPhone.substring(3);
  }
  // Remove 91
  else if (
    normalizedPhone.startsWith("91") &&
    normalizedPhone.length === 12
  ) {
    normalizedPhone = normalizedPhone.substring(2);
  }

  // Remove leading zero(s)
  normalizedPhone = normalizedPhone.replace(/^0+/, "");

  // Validate Indian mobile number
  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
    res.status(400);
    throw new Error("Invalid Indian mobile number");
  }

  // =====================================
  // Find Customer
  // =====================================

  const customer = await Customer.findOne({
    company: company._id,
    phone: normalizedPhone,
  }).select("+password");

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  if (!customer.isActive) {
    res.status(403);
    throw new Error("Customer account is inactive");
  }

  // =====================================
  // Update Password
  // =====================================

  customer.password = password;
  customer.portalAccessEnabled = true;
  customer.lastLoginAt = new Date();

  await customer.save();

  generateCustomerToken(res, customer._id);

  // =====================================
  // Activity Log
  // =====================================

  await logActivity({
    company: company._id,
    entityType: "Customer",
    entityId: customer._id,
    action: "CUSTOMER_PASSWORD_RESET",
    message: `${customer.name} reset portal password via ${company.slug}`,
  });

  // =====================================
  // Response
  // =====================================

  res.status(200).json({
    _id: customer._id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    area: customer.area,
    message: "Password updated successfully",
  });
});



const getCustomerCityOptions = async (req, res) => {
  try {
    const companyId = req.companyId;

    const cities = await City.find({
      company: companyId,
      
    });

    return res.json(cities);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
const getCustomerAreaOptions = asyncHandler(async (req, res) => {
  try {
    const companyId = req.companyId;
    const cityId = req.params.cityId;

    console.log("COMPANY ID:", companyId);
    console.log("CITY ID:", cityId);

    if (!companyId) {
      return res.status(400).json({
        message: "Invalid company context",
      });
    }

    if (!cityId) {
      return res.status(400).json({
        message: "City is required",
      });
    }

    /**
     * 🔥 FORCE OBJECTID TYPE (CRITICAL FIX)
     */
    const companyObjectId = new mongoose.Types.ObjectId(companyId);
    const cityObjectId = new mongoose.Types.ObjectId(cityId);

    /**
     * VALIDATE CITY
     */
    const cityExists = await City.findOne({
      _id: cityObjectId,
      company: companyObjectId,
    });

    if (!cityExists) {
      return res.status(400).json({
        message: "Invalid city for this company",
      });
    }

    /**
     * FETCH AREAS
     */
    const areas = await Area.find({
      company: companyObjectId,
      city: cityObjectId,
    })
      .select("name city")
      .sort({ name: 1 });

    console.log("AREAS FOUND:", areas.length);

    return res.json({
      success: true,
      data: areas,
    });

  } catch (err) {
    console.error("🔥 AREA API ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

/**
 * =====================================================
 * LOGIN CUSTOMER (NO TENANT REQUIRED)
 * =====================================================
 */
const loginCustomer = asyncHandler(async (req, res) => {
  let { phone, password } = req.body;

  if (!phone) {
    res.status(400);
    throw new Error("Phone is required");
  }

  // =====================================
  // 1. NORMALIZE PHONE (IMPORTANT FIX)
  // =====================================
  // =====================================
// Normalize Phone
// =====================================

const normalizedPhone = phone
  .replace(/\s+/g, "")
  .replace(/-/g, "")
  .replace(/^0+/, "") // Remove leading zero(s)
  .trim();

  // =====================================
  // 2. FIND CUSTOMER (RELAXED SEARCH FIRST)
  // =====================================
  const customer = await Customer.findOne({
    phone: normalizedPhone,
  }).select("+password");

  if (!customer) {
    res.status(401);
    throw new Error("Invalid phone number");
  }

  // =====================================
  // 3. CHECK STATUS FLAGS AFTER FINDING
  // =====================================
  if (!customer.isActive) {
    res.status(403);
    throw new Error("Account is inactive");
  }

  if (!customer.portalAccessEnabled) {
    res.status(403);
    throw new Error("Portal access not enabled");
  }

  // =====================================
  // 4. PASSWORD LOGIC (OPTIONAL SUPPORT)
  // =====================================
  if (customer.password) {
    if (!password) {
      res.status(400);
      throw new Error("Password is required");
    }

    const isMatch = await customer.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }
  }

  // =====================================
  // 5. RESOLVE TENANT FROM CUSTOMER
  // =====================================
  await customer.populate("company", "_id name slug");

  if (!customer.company) {
    res.status(400);
    throw new Error("Customer is not assigned to any company");
  }

  // =====================================
  // 6. UPDATE LOGIN INFO
  // =====================================
  customer.lastLoginAt = new Date();
  await customer.save();

  // =====================================
  // 7. GENERATE TOKEN
  // =====================================
  generateCustomerToken(res, customer._id);

  // =====================================
  // 8. RESPONSE
  // =====================================
  res.status(200).json({
    _id: customer._id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    company: customer.company,
  });
});

/**
 * =====================================================
 * LOGOUT CUSTOMER
 * =====================================================
 */
const logoutCustomer = asyncHandler(async (req, res) => {
  res.cookie("customerJwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: "Logged out successfully" });
});

/**
 * =====================================================
 * GET PROFILE
 * =====================================================
 */
const getCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id)
    .populate("company", "name slug logo")
    .populate("area", "name");

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  res.json(customer);
});

/**
 * =====================================================
 * UPDATE PROFILE
 * =====================================================
 */
const updateCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const { name, email, address, password } = req.body;

  if (name !== undefined) customer.name = name.trim();

  if (email !== undefined) {
    customer.email = email?.trim().toLowerCase();
  }

  if (address !== undefined) {
    customer.address = address;
  }

  if (password) {
    customer.password = password;
  }

  await customer.save();

  res.json(customer);
});

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */
export {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomerProfile,
  getCustomerAreaOptions,
  getCustomerCityOptions,
  updateCustomerProfile,
  forgotCustomerPassword,
};