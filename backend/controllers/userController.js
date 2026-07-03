import asyncHandler from "../middleware/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * ======================================
 * AUTH USER
 * ======================================
 */
const authUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
console.log("RAW PHONE:", JSON.stringify(req.body.phone));
  console.log("Login attempt:", phone);

  const user = await User.findOne({
    phone,
    isActive: true,
  }).populate("company", "name");

  console.log("User found:", !!user);

  if (user) {
    console.log("Stored phone:", user.phone);
    console.log("isActive:", user.isActive);

    const passwordMatch =
      await user.matchPassword(password);

    console.log("Password match:", passwordMatch);

    if (passwordMatch) {
      generateToken(res, user);

      user.lastLogin = new Date();
      await user.save();

      return res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        mustChangePassword:
          user.mustChangePassword || false,
        company: user.company,
      });
    }
  }

  res.status(401);
  throw new Error("Invalid phone or password");
});

/**
 * ======================================
 * REGISTER USER (MANAGER SCOPE ONLY)
 * ======================================
 */
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
  } = req.body;

  // =========================
  // CHECK DUPLICATE USER
  // =========================
  const existingUser = await User.findOne({
    phone,
  });

  if (existingUser) {
    res.status(400);
    throw new Error(
      "User already exists with this phone number"
    );
  }

  // =========================
  // CREATE USER (NO ROLE YET)
  // =========================
  const user = await User.create({
    name,
    email,
    phone,
    password,

    // 👇 IMPORTANT: no role assigned yet
    role: "unassigned",

    // no company yet (or null depending on schema)
    company: null,

    mustChangePassword: false,
  });

  // =========================
  // LOG ACTIVITY
  // =========================
  await logActivity({
    company: null,
    performedBy: user._id,
    entityType: "User",
    entityId: user._id,
    action: "REGISTER",
    message: `${user.name} registered`,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    company: user.company,
  });
});

const assignUserRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  const allowedRoles = [
    "manager",
    "dispatcher",
    "technician",
    "customer",
  ];

  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findOne({
    _id: userId,
    company: req.user.company,
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // prevent admin escalation
  if (role === "admin") {
    res.status(403);
    throw new Error("Cannot assign admin role");
  }

  const oldRole = user.role;

  user.role = role;

  // if assigning to company for first time
  user.company = req.user.company;

  user.mustChangePassword = true;

  await user.save();

  await logActivity({
    company: req.user.company,
    performedBy: req.user._id,
    entityType: "User",
    entityId: user._id,
    action: "ASSIGN_ROLE",
    message: `${req.user.name} assigned ${role} to ${user.name}`,
  });

  res.json({
    message: "Role assigned successfully",
    user,
  });
});

/**
 * ======================================
 * CHANGE PASSWORD
 * ======================================
 */

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect.");
  }

  // Prevent using the same password again
  const isSamePassword = await user.matchPassword(newPassword);

  if (isSamePassword) {
    res.status(400);
    throw new Error(
      "New password must be different from the current password."
    );
  }

  // Assign plain text password.
  // The pre-save hook will hash it.
  user.password = newPassword;

  // User has now changed the default password
  user.mustChangePassword = false;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { phone, newPassword } = req.body;

  if (!phone || !newPassword) {
    res.status(400);
    throw new Error(
      "Phone number and new password are required"
    );
  }

  const trimmedPhone = phone.trim();
  const trimmedNewPassword = newPassword.trim();

  if (trimmedNewPassword.length < 8) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters long"
    );
  }

  if (trimmedNewPassword === "12345") {
    res.status(400);
    throw new Error(
      "Please choose a stronger password"
    );
  }

  const user = await User.findOne({
    phone: trimmedPhone,
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isSamePassword = await user.matchPassword(
    trimmedNewPassword
  );

  if (isSamePassword) {
    res.status(400);
    throw new Error(
      "New password must be different from the current password"
    );
  }

  user.password = trimmedNewPassword;
  user.mustChangePassword = false;

  await user.save();

  const companyId =
    user.company?._id || user.company;

  await logActivity({
    company: companyId,
    performedBy: user._id,
    entityType: "User",
    entityId: user._id,
    action: "FORGOT_PASSWORD",
    message: `${user.name} reset password using forgot password`,
  });

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

/**
 * ======================================
 * LOGOUT
 * ======================================
 */
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: "Logged out successfully" });
};

/**
 * ======================================
 * GET PROFILE
 * ======================================
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.user._id,
    company: req.user.company,
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

/**
 * ======================================
 * UPDATE PROFILE
 * ======================================
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.user._id,
    company: req.user.company,
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const oldName = user.name;

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updated = await user.save();

  await logActivity({
    company: updated.company,
    entityType: "User",
    entityId: updated._id,
    action: "UPDATE_PROFILE",
    message: `Profile updated (${oldName} → ${updated.name})`,
  });

  res.json(updated);
});

/**
 * ======================================
 * GET USERS (MANAGER ONLY, COMPANY SCOPED)
 * ======================================
 */
const getUsers = asyncHandler(async (req, res) => {
  // 1. Authorization check: only manager allowed
  if (req.user.role !== "manager") {
    return res.status(403).json({
      message: "Access denied. Only managers can view users.",
    });
  }

  // 2. Fetch users excluding admin role
  const users = await User.find({
    company: req.user.company,
    role: { $ne: "admin" }, // exclude admin users
  }).select("-password");

  res.json(users);
});


/**
 * ======================================
 * GET USER BY ID (COMPANY SCOPED)
 * ======================================
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    company: req.user.company,
  }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

/**
 * ======================================
 * UPDATE USER (MANAGER ONLY)
 * ======================================
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(403);
    throw new Error("Managers cannot modify admin users");
  }

  if (req.body.role === "admin") {
    res.status(403);
    throw new Error("Managers cannot assign admin role");
  }

  const oldRole = user.role;

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;

  if (req.body.role) user.role = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

  const updated = await user.save();

  await logActivity({
    company: updated.company,
    performedBy: req.user._id,
    entityType: "User",
    entityId: updated._id,
    action: "UPDATE_USER",
    message: `${req.user.name} updated ${updated.name}`,
  });

  res.json(updated);
});

const getTechnicianUserOptions = asyncHandler(async (req, res) => {
  console.log("=== CONTROLLER HIT ===");
  console.log("USER ROLE:", req.user?.role);

  // ✅ FIX: company can be Object OR ObjectId
  const companyId = req.user?.company?._id
    ? req.user.company._id
    : req.user.company;

  if (!companyId) {
    res.status(400);
    throw new Error("Company context missing in request");
  }

  const technicians = await User.find({
    company: companyId,
    role: "technician",
    isActive: true,
  })
    .select("_id name email phone")
    .sort({ name: 1 })
    .lean();

  

  res.json(technicians);
});


/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res.status(400);
    throw new Error("Phone and password are required");
  }

  const user = await User.findOne({
    phone,
    isActive: true,
  }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  user.lastLogin = new Date();
  await user.save();

  return res.status(200).json({
    success: true,
    token: generateToken(user._id, user.company),

    mustChangePassword: user.mustChangePassword,

    user: {
      id: user._id,
      company: user.company,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

/**
 * @desc Change password after first login
 * @route POST /api/auth/change-password
 * @access Private
 */


/**
 * @desc Get logged in user
 * @route GET /api/auth/me
 * @access Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("company", "name")
    .populate("technicianProfile");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc Manager/Admin creates user
 * @route POST /api/users
 * @access Private (Admin/Manager)
 */
const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    role,
    technicianProfile,
  } = req.body;

  // Handle populated company object or ObjectId
  const companyId =
    req.user.company?._id || req.user.company;

  // Validate role
  const allowedRoles = [
    "manager",
    "dispatcher",
    "technician",
  ];

  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  // Prevent admin creation
  if (role === "admin") {
    res.status(403);
    throw new Error("Cannot create admin users");
  }

  // Check duplicate phone within company
  const existingUser = await User.findOne({
    company: companyId,
    phone,
  });

  if (existingUser) {
    res.status(400);
    throw new Error(
      "User with this phone number already exists"
    );
  }

  // Create user with default password
  const user = await User.create({
    company: companyId,
    name,
    email,
    phone,
    role,
    technicianProfile,

    password: "12345",
    mustChangePassword: true,
    isActive: true,
  });

  // Activity log
  await logActivity({
    company: companyId,
    performedBy: req.user._id,
    entityType: "User",
    entityId: user._id,
    action: "CREATE_USER",
    message: `${req.user.name} created ${user.name} as ${role}`,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",

    credentials: {
      phone,
      temporaryPassword: "12345",
    },

    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
    },
  });
});
/**
 * ======================================
 * DELETE USER (SOFT DELETE)
 * ======================================
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(403);
    throw new Error("Managers cannot delete admin users");
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot deactivate your own account");
  }

  user.isActive = false;
  await user.save();

  await logActivity({
    company: user.company,
    performedBy: req.user._id,
    entityType: "User",
    entityId: user._id,
    action: "DEACTIVATE_USER",
    message: `${req.user.name} deactivated ${user.name}`,
  });

  res.json({ message: "User deactivated" });
});

export {
  authUser,
  createUser,
  registerUser,
  assignUserRole,
  changePassword,
  forgotPassword,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  getTechnicianUserOptions,
  deleteUser,
};