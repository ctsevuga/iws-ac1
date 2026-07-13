import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import connectDB from "./config/db.js";
import activityRoutes from "./routes/activityRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import customerAuthRoutes from "./routes/customerAuthRoutes.js";
import customerServiceRoutes from "./routes/customerServiceRoutes.js";
import customerPortalSettingsRoutes from "./routes/customerPortalSettingsRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import cityMasterRoutes from "./routes/cityMasterRoutes.js";
import areaMasterRoutes from "./routes/areaMasterRoutes.js";
import companyServiceAreaRoutes from "./routes/companyServiceAreaRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import billingDashboardRoutes from "./routes/billingDashboardRoutes.js";
import companyBillingRoutes from "./routes/companyBillingRoutes.js";

import startBillingCron from "./cron/billingCron.js";

import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/activities", activityRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/customersauths", customerAuthRoutes);
app.use("/api/customerservices", customerServiceRoutes);
app.use("/api/customerportals", customerPortalSettingsRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/serviceRequests", serviceRequestRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/dasboardbilling", billingDashboardRoutes);
app.use("/api/companybilling", companyBillingRoutes);

app.use("/api/citymaster", cityMasterRoutes);
app.use("/api/areamaster", areaMasterRoutes);
app.use("/api/companyserviceareas", companyServiceAreaRoutes);

app.use("/api/upload", uploadRoutes);

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

app.use(notFound);
app.use(errorHandler);
startBillingCron();
app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
