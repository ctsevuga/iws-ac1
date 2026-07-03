import express from "express";

import {
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
  deleteUser,
  getUserById,
  updateUser,
  getTechnicianUserOptions,
} from "../controllers/userController.js";

import {
  protect,
  admin,
  manager,
} from "../middleware/authMiddleware.js";

const router = express.Router();
router.get(
  "/technician-options",
  protect,
  getTechnicianUserOptions
);
// Manager creates company users
router.post(
  "/create",
  protect,
  manager,
  createUser
);
/**
 * ======================================
 * AUTH ROUTES
 * ======================================
 */

// Login
router.post("/auth", authUser);

// Logout
router.post("/logout", logoutUser);

/**
 * ======================================
 * PUBLIC REGISTRATION
 * ======================================
 *
 * Anyone can register (NO ROLE ASSIGNED HERE)
 */

router.post("/", registerUser);

/**
 * ======================================
 * AUTHENTICATED USER PROFILE
 * ======================================
 */
router.put(
  "/change-password",
  protect,
  changePassword
);
router.put(
  "/forgot-password",
  protect,
  forgotPassword
);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

/**
 * ======================================
 * USER MANAGEMENT (MANAGER SCOPE)
 * ======================================
 *
 * Company-scoped user operations
 */

// Get all users in company
router.get(
  "/",
  protect,
  manager,
  getUsers
);

// Assign role to a user (NEW FLOW)
router.put(
  "/assign-role",
  protect,
  manager,
  assignUserRole
);

/**
 * ======================================
 * SINGLE USER OPERATIONS
 * ======================================
 */

router
  .route("/:id")
  .get(protect, manager, getUserById)
  .put(protect, manager, updateUser)
  .delete(protect, manager, deleteUser);

export default router;