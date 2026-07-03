import Company from "../models/companyModel.js";

export const resolveCompany = async (req, res, next) => {
  try {
    let company = null;

    const host = req.hostname?.toLowerCase().replace(/^www\./, "");

    // =========================
    // 🔥 SAFE SLUG EXTRACTION
    // =========================
    const pathSegments = req.path.split("/").filter(Boolean);
    const slugFromPath = pathSegments[0]; // <-- THIS IS THE RELIABLE ONE

    // fallback (only for debug visibility)
    const slugFromParams = req.params?.slug;

    console.log("\n===== TENANT DEBUG START =====");
    console.log("METHOD:", req.method);
    console.log("HOST:", host);
    console.log("FULL URL:", req.originalUrl);
    console.log("BASE URL:", req.baseUrl);
    console.log("PATH:", req.path);
    console.log("PATH SEGMENTS:", pathSegments);
    console.log("SLUG FROM PATH:", slugFromPath);
    console.log("SLUG FROM PARAMS:", slugFromParams);
    console.log("==============================\n");

    // =========================
    // 1. DOMAIN MATCH
    // =========================
    if (host && host !== "localhost") {
      company = await Company.findOne({
        domain: host,
        isActive: true,
      });

      console.log("DOMAIN MATCH:", company ? company.slug : "NOT FOUND");
    }

    // =========================
    // 2. SLUG MATCH (PRIMARY)
    // =========================
    if (!company && slugFromPath) {
      company = await Company.findOne({
        slug: slugFromPath,
        isActive: true,
      });

      console.log("SLUG MATCH:", company ? company.slug : "NOT FOUND");
    }

    // =========================
    // 3. ATTACH CONTEXT
    // =========================
    req.company = company || null;
    req.companyId = company?._id || null;

    console.log("FINAL COMPANY ID:", req.companyId);
    console.log("===== TENANT DEBUG END =====\n");

    // =========================
    // 4. HARD FAIL (OPTIONAL)
    // =========================
    if (!req.companyId) {
  console.warn("⚠️ No tenant resolved for:", req.originalUrl);
  return next(); // allow non-tenant routes
}

    next();
  } catch (error) {
    console.error("❌ Tenant resolution error:", error);
    return res.status(500).json({
      message: "Failed to resolve company",
    });
  }
};