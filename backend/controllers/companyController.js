import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Company from "../models/companyModel.js";
import User from "../models/userModel.js";
import Area from "../models/areaModel.js";
import City from "../models/cityModel.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * @desc    Create new company
 * @route   POST /api/companies
 */




const createCompany = asyncHandler(async (req, res) => {
  const {
    name,
    legalName,
    email,
    phone,
    website,
    address,
    branding,
    settings,
    plan,
    subscriptionStatus,
    domain, // optional (important)
  } = req.body;

  const session = await mongoose.startSession();

  try {
    console.log("\n=== CREATE COMPANY START ===");

    // =========================
    // 1. Check Existing User
    // =========================
    const existingUser = await User.findOne({
      $or: [{ phone }, { email: email?.toLowerCase() }],
    });

    if (existingUser) {
      throw new Error("A user already exists with this email or phone number");
    }

    // =========================
    // 2. Generate Slug
    // =========================
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // =========================
    // 3. Start Transaction
    // =========================
    session.startTransaction();

    // =========================
    // 4. Build Company Payload (IMPORTANT FIX HERE)
    // =========================
    const companyData = {
      name,
      legalName,
      email,
      phone,
      website,
      address,

      slug,

      brand: {
        primaryColor: branding?.primaryColor,
        secondaryColor: branding?.secondaryColor,
        faviconUrl: branding?.faviconUrl,
      },

      settings,
      plan,
      subscriptionStatus,
    };

    // ✅ ONLY add domain if provided (NO null insertion)
    if (domain && domain.trim()) {
      companyData.domain = domain.trim().toLowerCase();
    }

    // =========================
    // 5. Create Company
    // =========================
    const companies = await Company.create([companyData], { session });
    const company = companies[0];

    console.log("Company created:", company._id);

    // =========================
    // 6. City
    // =========================
    let cityDoc = null;

    if (address?.city) {
      cityDoc = await City.findOne({
        company: company._id,
        name: address.city.trim(),
      }).session(session);

      if (!cityDoc) {
        const cities = await City.create(
          [
            {
              company: company._id,
              name: address.city.trim(),
            },
          ],
          { session }
        );

        cityDoc = cities[0];
      }
    }

    // =========================
    // 7. Area
    // =========================
    const areaName = address?.city
      ? `${address.city} Service Area`
      : "Primary Service Area";

    const areas = await Area.create(
      [
        {
          company: company._id,
          city: cityDoc?._id,
          name: areaName,
        },
      ],
      { session }
    );

    const defaultArea = areas[0];

    // =========================
    // 8. Manager User
    // =========================
    const users = await User.create(
      [
        {
          company: company._id,
          name: `${name} Manager`,
          email,
          phone,
          password: "123456",
          role: "manager",
          mustChangePassword: true,
          isActive: true,
        },
      ],
      { session }
    );

    const managerUser = users[0];

    // =========================
    // 9. Activity Logs
    // =========================
    await logActivity(
      {
        company: company._id,
        performedBy: null,
        entityType: "Company",
        entityId: company._id,
        action: "CREATE_COMPANY",
        message: `Company ${company.name} created with slug ${company.slug}`,
      },
      session
    );

    if (cityDoc) {
      await logActivity(
        {
          company: company._id,
          performedBy: null,
          entityType: "City",
          entityId: cityDoc._id,
          action: "CREATE_CITY",
          message: `City ${cityDoc.name} created`,
        },
        session
      );
    }

    await logActivity(
      {
        company: company._id,
        performedBy: null,
        entityType: "Area",
        entityId: defaultArea._id,
        action: "CREATE_AREA",
        message: `Default service area ${defaultArea.name} created`,
      },
      session
    );

    await logActivity(
      {
        company: company._id,
        performedBy: null,
        entityType: "User",
        entityId: managerUser._id,
        action: "CREATE_USER",
        message: `Manager user ${managerUser.name} created for ${company.name}`,
      },
      session
    );

    // =========================
    // 10. Commit
    // =========================
    await session.commitTransaction();

    await defaultArea.populate("city");

    // =========================
    // 11. Response
    // =========================
    res.status(201).json({
      success: true,
      company,
      city: cityDoc,
      defaultArea,
      managerUser: {
        _id: managerUser._id,
        name: managerUser.name,
        email: managerUser.email,
        phone: managerUser.phone,
        role: managerUser.role,
        mustChangePassword: managerUser.mustChangePassword,
      },
      defaultPassword: "123456",
      accessUrl: `https://ourhvac.com/${company.slug}`,
    });
  } catch (err) {
    await session.abortTransaction();

    console.error("CREATE COMPANY ERROR:", err.message);

    if (err.code === 11000) {
      throw new Error(`Duplicate key error: ${JSON.stringify(err.keyValue)}`);
    }

    throw err;
  } finally {
    await session.endSession();
  }
});





/**
 * @desc    Get current company
 */

const getMyCompany = asyncHandler(async (req, res) => {
  let company = null;

  // =========================
  // 1. Use middleware-resolved company (tenant routing via slug/domain)
  // =========================
  if (req.company?._id) {
    company = await Company.findById(req.company._id);
  }

  // =========================
  // 2. Fallback: company from authenticated user
  // =========================
  if (!company && req.user?.company) {
    company = await Company.findById(req.user.company);
  }

  // =========================
  // 3. Validate existence + active status
  // =========================
  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found"
    });
  }

  if (!company.isActive) {
    return res.status(403).json({
      success: false,
      message: "Company is inactive"
    });
  }

  // =========================
  // 4. Response (safe serialization)
  // =========================
  res.status(200).json({
    success: true,
    data: company
  });
});



/**
 * @desc    Update company (ADMIN)
 */
const updateCompany = asyncHandler(async (req, res) => {
  console.log("🔥 ADMIN UPDATE COMPANY CONTROLLER HIT");

  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  const oldName = company.name;

  // =========================
  // BASIC FIELDS
  // =========================
  company.name = req.body.name ?? company.name;
  company.legalName = req.body.legalName ?? company.legalName;
  company.email = req.body.email ?? company.email;
  company.phone = req.body.phone ?? company.phone;
  company.website = req.body.website ?? company.website;
  company.address = req.body.address ?? company.address;

  company.timezone = req.body.timezone ?? company.timezone;
  company.currency = req.body.currency ?? company.currency;

  company.logoUrl = req.body.logoUrl ?? company.logoUrl;

  // =========================
  // BRANDING (NEW MODEL FIX)
  // =========================
  if (req.body.branding && typeof req.body.branding === "object") {
    const allowedBranding = [
      "logoUrl",
      "faviconUrl",
      "primaryColor",
      "secondaryColor",
      "supportEmail",
      "supportPhone",
    ];

    for (const key of allowedBranding) {
      if (req.body.branding[key] !== undefined) {
        company.branding[key] = req.body.branding[key];
      }
    }
  }

  // =========================
  // SETTINGS UPDATE
  // =========================
  if (req.body.settings && typeof req.body.settings === "object") {
    const allowedSettings = [
      "allowOnlineBooking",
      "autoAssignTechnician",
      "defaultJobDurationMinutes",
      "enableInvoicing",
      "enablePayments",
      "autoNotifyTechnicians",
      "enableLiveTracking",
    ];

    for (const key of allowedSettings) {
      if (req.body.settings[key] !== undefined) {
        company.settings[key] = req.body.settings[key];
      }
    }
  }

  // =========================
  // PORTAL SETTINGS UPDATE (NEW MODEL FIX)
  // =========================
  if (req.body.portalSettings && typeof req.body.portalSettings === "object") {
    const allowedPortal = [
      "allowCustomerRegistration",
      "allowGuestServiceRequests",
      "customerPortalEnabled",
      "mobileAppEnabled",
    ];

    for (const key of allowedPortal) {
      if (req.body.portalSettings[key] !== undefined) {
        company.portalSettings[key] = req.body.portalSettings[key];
      }
    }
  }

  const updatedCompany = await company.save();

  // =========================
  // ACTIVITY LOG
  // =========================
  await logActivity({
    company: company._id,
    entityType: "Company",
    entityId: company._id,
    action: "UPDATE_COMPANY",
    message: `Company updated${
      oldName !== updatedCompany.name
        ? ` (name: ${oldName} → ${updatedCompany.name})`
        : ""
    }`,
  });

  if (req.body.settings || req.body.branding || req.body.portalSettings) {
    await logActivity({
      company: company._id,
      entityType: "Company",
      entityId: company._id,
      action: "UPDATE_CONFIGURATION",
      message: "Company configuration updated",
    });
  }

  res.json(updatedCompany);
});

/**
 * @desc    Manager update own company
 */


const updateMyCompany = asyncHandler(async (req, res) => {
  console.log("🔥 UPDATE COMPANY CONTROLLER HIT");

  // =========================
  // Resolve company ID safely
  // =========================
  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?._id ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found for user");
  }

  const company = await Company.findById(companyId);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  const oldName = company.name;

  // =========================
  // BASIC INFO
  // =========================
  company.name = req.body.name ?? company.name;
  company.legalName = req.body.legalName ?? company.legalName;
  company.phone = req.body.phone ?? company.phone;
  company.website = req.body.website ?? company.website;

  // Email change (optional but risky in SaaS)
  if (req.body.email) {
    company.email = req.body.email.toLowerCase().trim();
  }

  // =========================
  // 🔒 TENANT ROUTING (PROTECTED)
  // =========================
  // IMPORTANT: only allow slug/domain update if you explicitly want it editable
  // and ensure uniqueness validation at DB level handles conflicts.

  if (req.body.slug && req.body.slug !== company.slug) {
    company.slug = req.body.slug.toLowerCase().trim();
  }

  if (req.body.domain && req.body.domain !== company.domain) {
    company.domain = req.body.domain.toLowerCase().trim();
  }

  // =========================
  // ADDRESS (SAFE MERGE)
  // =========================
  if (req.body.address) {
    company.address = {
      ...company.address,
      ...req.body.address,
    };
  }

  // =========================
  // BUSINESS SETTINGS
  // =========================
  company.timezone = req.body.timezone ?? company.timezone;
  company.currency = req.body.currency ?? company.currency;

  // =========================
  // BRANDING (SAFE MERGE)
  // =========================
  if (req.body.brand) {
    company.brand = {
      ...company.brand,
      ...req.body.brand,
    };
  }

  // backward compatibility
  if (req.body.logoUrl) {
    company.logoUrl = req.body.logoUrl;
  }

  // =========================
  // SETTINGS (SAFE MERGE)
  // =========================
  if (req.body.settings) {
    company.settings = {
      ...company.settings,
      ...req.body.settings,
    };
  }

  // =========================
  // 🚫 SECURITY: BLOCK SYSTEM FIELDS
  // =========================
  // Do NOT allow normal users to modify:
  // plan, subscriptionStatus, trialEndsAt, isActive
  // (handle in admin/billing controllers only)

  // =========================
  // SAVE
  // =========================
  const updatedCompany = await company.save();

  // =========================
  // ACTIVITY LOG
  // =========================
  await logActivity({
    company: company._id,
    entityType: "Company",
    entityId: company._id,
    action: "UPDATE_COMPANY",
    message:
      oldName !== updatedCompany.name
        ? `Company updated (name: ${oldName} → ${updatedCompany.name})`
        : "Company updated",
  });

  res.status(200).json({
    success: true,
    data: updatedCompany,
  });
});



/**
 * @desc    Get all companies
 */
const getCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // =========================
  // 1. Fetch companies (lean for performance)
  // =========================
  const companies = await Company.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select(
      "name legalName email phone slug domain address plan isActive createdAt"
    )
    .lean();

  // =========================
  // 2. Count total
  // =========================
  const count = await Company.countDocuments();

  // =========================
  // 3. Response
  // =========================
  res.status(200).json({
    companies,
    page: Number(page),
    pages: Math.ceil(count / Number(limit)),
    total: count,
  });
});

/**
 * @desc    Get company by ID
 */
const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  // =========================
  // 1. Not found
  // =========================
  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  // =========================
  // 2. Authorization check (manager isolation)
  // =========================
  if (req.user?.role === "manager") {
    const isSameCompany =
      company._id.toString() === req.user.company?.toString();

    if (!isSameCompany) {
      res.status(403);
      throw new Error("Not authorized to access this company");
    }
  }

  // =========================
  // 3. Response (clean + safe)
  // =========================
  res.status(200).json({
    _id: company._id,
    name: company.name,
    legalName: company.legalName,
    email: company.email,
    phone: company.phone,
    website: company.website,

    slug: company.slug,
    domain: company.domain,

    address: company.address,

    logoUrl: company.logoUrl,
    brand: company.brand,

    timezone: company.timezone,
    currency: company.currency,

    plan: company.plan,
    subscriptionStatus: company.subscriptionStatus,
    trialEndsAt: company.trialEndsAt,

    settings: company.settings,

    isActive: company.isActive,

    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  });
});

/**
 * @desc    Deactivate company
 */
const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  if (company._id.toString() !== req.user.company.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  company.isActive = false;
  await company.save();

  await logActivity({
    company: req.user.company,
    entityType: "Company",
    entityId: company._id,
    action: "DEACTIVATE_COMPANY",
    message: `Company ${company.name} deactivated`,
  });

  res.json({ message: "Company deactivated" });
});

export {
  createCompany,
  getMyCompany,
  updateCompany,
  updateMyCompany,
  getCompanies,
  getCompanyById,
  deleteCompany,
};