import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

// Protect routes (authenticated users only)
const protect = asyncHandler(async (req, res, next) => {
  // console.log("PROTECT MIDDLEWARE HIT");
  let token;

  // =========================================
  // 1. READ TOKEN (COOKIE OR HEADER)
  // =========================================

  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    // =========================================
    // 2. VERIFY TOKEN
    // =========================================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // =========================================
    // 3. LOAD USER (TENANT-SAFE)
    // =========================================
    const userQuery = { _id: decoded.userId };

    // OPTIONAL: if token contains company, enforce it safely
    if (decoded.companyId) {
      userQuery.company = decoded.companyId;
    }

    const user = await User.findOne(userQuery)
      .select("-password")
      .populate("company", "_id name slug domain")
      .populate("technicianProfile");

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("User not found or inactive");
    }

    // =========================================
    // 4. ATTACH USER
    // =========================================
    req.user = user;

    next();
  } catch (error) {
  console.error("🔥 JWT VERIFY FAILED FULL ERROR:");
  console.error("Message:", error.message);
  console.error("Token received:", token);
  console.error("JWT_SECRET exists:", !!process.env.JWT_SECRET);

  res.status(401);
  throw new Error(error.message);
}
});

/**
 * Role-based authorization middleware
 * Usage:
 *   authorize("admin")
 *   authorize("admin", "manager")
 *   authorize("dispatcher", "technician")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // console.log("🔥 AUTHORIZE CHECK:", {
    //   userRole: req.user?.role,
    //   required: roles,
    // });

    if (!req.user) {
      return res.status(401).json({ message: "No user" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden",
        userRole: req.user.role,
        required: roles,
      });
    }

    next();
  };
};

const requirePasswordChange = (req, res, next) => {
  if (req.user.mustChangePassword) {
    return res.status(403).json({
      success: false,
      mustChangePassword: true,
      message:
        "You must change your password before accessing the system",
    });
  }

  next();
};

// Optional convenience middlewares
const admin = authorize("admin");

const manager = authorize("admin", "manager");

const dispatcher = authorize(
  "admin",
  "manager",
  "dispatcher"
);

const technician = authorize(
  "admin",
  "manager",
  "dispatcher",
  "technician"
);

export {
  protect,
  authorize,
  admin,
  manager,
  dispatcher,
  technician,
  requirePasswordChange,
};