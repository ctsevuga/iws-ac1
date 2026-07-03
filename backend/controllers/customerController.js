import asyncHandler from "../middleware/asyncHandler.js";
import Customer from "../models/customerModel.js";
import Area from "../models/areaModel.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * ACCESS RULES
 *
 * Manager:
 *   Full customer management
 *
 * Dispatcher:
 *   Create / View / Update customers
 *
 * Technician:
 *   View-only access
 *
 * Admin:
 *   No customer access
 */

/**
 * Helper: Validate customer access
 */
const validateCustomerAccess = (user, allowedRoles) => {
  if (!allowedRoles.includes(user.role)) {
    const error = new Error("Not authorized to access customer management");
    error.statusCode = 403;
    throw error;
  }
};

/**
 * @desc    Create new customer
 * @access  Manager, Dispatcher
 */
const createCustomer = asyncHandler(async (req, res) => {
  validateCustomerAccess(req.user, [
    "manager",
    "dispatcher",
  ]);

  const {
    name,
    phone,
    email,
    address,
    notes,
    area,
  } = req.body;

  /**
   * Check duplicate customer
   */
  const customerExists = await Customer.findOne({
    company: req.user.company,
    phone,
  });

  if (customerExists) {
    res.status(400);
    throw new Error(
      "Customer already exists with this phone number"
    );
  }

  /**
   * Validate Area
   */
  let selectedArea = null;

  if (area) {
    selectedArea = await Area.findOne({
      _id: area,
      company: req.user.company,
    }).populate("city");

    if (!selectedArea) {
      res.status(400);
      throw new Error("Invalid area");
    }
  }

  /**
   * Create Customer
   */
  const customer = await Customer.create({
    company: req.user.company,

    name,
    phone,
    email,

    address,
    notes,

    area,

    // Staff-created customer
    portalAccessEnabled: false,
    registrationSource: "staff",
  });

  /**
   * Audit Log
   */
  await logActivity({
    company: req.user.company,
    entityType: "Customer",
    entityId: customer._id,
    action: "CREATE_CUSTOMER",
    message: `Customer ${customer.name} created`,
  });

  /**
   * Populate Area + City
   */
  const populatedCustomer =
    await Customer.findById(customer._id)
      .populate({
        path: "area",
        populate: {
          path: "city",
          select: "name state country",
        },
      });

  res.status(201).json(populatedCustomer);
});

/**
 * @desc    Get all customers
 * @access  Manager, Dispatcher, Technician
 */
const getCustomers = asyncHandler(async (req, res) => {
  validateCustomerAccess(req.user, [
    "manager",
    "dispatcher",
    "technician",
  ]);

  const {
    search,
    page = 1,
    limit = 20,
    area,
    isActive,
  } = req.query;

  const query = {
    company: req.user.company,
  };

  // Search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Area filter
  if (area) {
    query.area = area;
  }

  // Active filter
  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const skip = (Number(page) - 1) * Number(limit);

  const customers = await Customer.find(query)
    .populate("area")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Customer.countDocuments(query);

  res.json({
    customers,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

/**
 * @desc    Get customer by ID
 * @access  Manager, Dispatcher, Technician
 */
const getCustomerById = asyncHandler(async (req, res) => {
  validateCustomerAccess(req.user, [
    "manager",
    "dispatcher",
    "technician",
  ]);

  const customer = await Customer.findOne({
    _id: req.params.id,
    company: req.user.company,
  }).populate("area");

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  res.json(customer);
});

/**
 * @desc    Update customer
 * @access  Manager, Dispatcher
 */
const updateCustomer = asyncHandler(async (req, res) => {
  validateCustomerAccess(req.user, ["manager", "dispatcher"]);

  const customer = await Customer.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  // Validate area
  if (req.body.area) {
    const areaExists = await Area.findOne({
      _id: req.body.area,
      company: req.user.company,
    });

    if (!areaExists) {
      res.status(400);
      throw new Error("Invalid area");
    }
  }

  const oldName = customer.name;

  customer.name = req.body.name || customer.name;
  customer.phone = req.body.phone || customer.phone;
  customer.email = req.body.email || customer.email;
  customer.address = req.body.address || customer.address;
  customer.notes = req.body.notes || customer.notes;
  customer.area =
    req.body.area !== undefined
      ? req.body.area
      : customer.area;

  // Only manager can activate/deactivate
  if (
    req.user.role === "manager" &&
    req.body.isActive !== undefined
  ) {
    customer.isActive = req.body.isActive;
  }

  const updatedCustomer = await customer.save();

  await logActivity({
    company: req.user.company,
    entityType: "Customer",
    entityId: customer._id,
    action: "UPDATE_CUSTOMER",
    message: `Customer updated (${oldName} → ${updatedCustomer.name})`,
  });

  const populatedCustomer =
    await updatedCustomer.populate("area");

  res.json(populatedCustomer);
});

/**
 * @desc    Soft delete customer
 * @access  Manager only
 */
const deleteCustomer = asyncHandler(async (req, res) => {
  validateCustomerAccess(req.user, ["manager"]);

  const customer = await Customer.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  customer.isActive = false;

  await customer.save();

  await logActivity({
    company: req.user.company,
    entityType: "Customer",
    entityId: customer._id,
    action: "DEACTIVATE_CUSTOMER",
    message: `Customer ${customer.name} deactivated`,
  });

  res.json({
    message: "Customer deactivated",
  });
});

/**
 * @desc    Reactivate customer
 * @access  Manager only
 */
const reactivateCustomer = asyncHandler(async (req, res) => {
  validateCustomerAccess(req.user, ["manager"]);

  const customer = await Customer.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  customer.isActive = true;

  await customer.save();

  await logActivity({
    company: req.user.company,
    entityType: "Customer",
    entityId: customer._id,
    action: "REACTIVATE_CUSTOMER",
    message: `Customer ${customer.name} reactivated`,
  });

  res.json({
    message: "Customer reactivated",
  });
});

export {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  reactivateCustomer,
};