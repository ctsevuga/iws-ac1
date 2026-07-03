import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import Customer from "../models/customerModel.js";

export const protectCustomer = asyncHandler(async (req, res, next) => {
  let token = null;

  // console.log("🔥 CUSTOMER AUTH COOKIE:", req.cookies);

  if (req.cookies?.customerJwt) {
    token = req.cookies.customerJwt;
  }

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // console.log("🔥 CUSTOMER TOKEN:", token);

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.customerId).select("-password");

    if (!customer) {
      res.status(401);
      throw new Error("Customer not found");
    }

    // Ensure tenant context exists
    // console.log("🔥 RESOLVED COMPANY:", req.company);

const companyId = req.company?._id;

if (!companyId) {
  // console.log("❌ COMPANY RESOLUTION FAILED");
  // console.log("HOST:", req.hostname);
  // console.log("PATH:", req.path);

  res.status(401);
  throw new Error("Company context not found");
}

    // Ensure customer belongs to tenant
    if (customer.company.toString() !== req.company._id.toString()) {
      res.status(403);
      throw new Error("Customer does not belong to this company");
    }

    // Ensure customer is active
    if (!customer.isActive) {
      res.status(401);
      throw new Error("Customer account is inactive");
    }

    req.customer = customer;

    next();
  } catch (error) {
    // console.error("🔥 JWT ERROR:", error.message);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});