// seedAdminUser.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js"; // adjust path as needed

dotenv.config();

const seedAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const companyId = "6a3b2c023fd48a511c3ecda5";

    // Remove existing admin with same email if needed
    await User.deleteMany({
      company: companyId,
      email: "admin@company.com",
    });

    const adminUser = await User.create({
      company: companyId,
      name: "System Admin",
      email: "admin@company.com",
      phone: "9876543210",
      password: "Admin@123", // will be hashed by pre-save hook
      mustChangePassword: true,
      role: "admin",
      isActive: true,
    });

    console.log("Admin user created:");
    console.log({
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exit(1);
  }
};

seedAdminUser();