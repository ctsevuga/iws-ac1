import asyncHandler from "../middleware/asyncHandler.js";
import CustomerPortalSettings from "../models/customerPortalSettingsSchema.js";
import Company from "../models/companyModel.js";

export const createPortalSettings = asyncHandler(async (req, res) => {
  const {
    portalTitle,
    portalSubtitle,
    heroImage,
    companyLogo,
    primaryColor,
    secondaryColor,
    contactPhone,
    whatsappPhone,
    supportEmail,
    website,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    country,
    businessHours,
    welcomeMessage,
    serviceRequestInstructions,
    emergencyContactMessage,
    facebookUrl,
    instagramUrl,
    youtubeUrl,
    linkedinUrl,
    enableRegistration,
    enableTestimonials,
    enableWhatsappButton,
    services,
    specialServices,
    announcements,

    // ================= NEW FIELD =================
    callToAction,
  } = req.body;

  // ===============================
  // Get company ID from logged-in user
  // ===============================
  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  // ===============================
  // Validate company
  // ===============================
  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  // ===============================
  // Check existing portal settings
  // ===============================
  const existing = await CustomerPortalSettings.findOne({
    company: companyId,
  });

  // ===============================
  // Prepare payload
  // ===============================
  const payload = {
    portalTitle,
    portalSubtitle,
    heroImage,
    companyLogo,
    primaryColor,
    secondaryColor,
    contactPhone,
    whatsappPhone,
    supportEmail,
    website,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    country,
    businessHours,
    welcomeMessage,
    serviceRequestInstructions,
    emergencyContactMessage,
    facebookUrl,
    instagramUrl,
    youtubeUrl,
    linkedinUrl,
    enableRegistration,
    enableTestimonials,
    enableWhatsappButton,
    services,
    specialServices,
    announcements,

    // ================= NEW CTA FIELD =================
    callToAction: callToAction
      ? {
          enabled: callToAction.enabled ?? true,
          title: callToAction.title,
          description: callToAction.description,
          titleTamil: callToAction.titleTamil,
          descriptionTamil: callToAction.descriptionTamil,
          buttonText: callToAction.buttonText,
          buttonTextTamil: callToAction.buttonTextTamil,
          icon: callToAction.icon,
          backgroundColor: callToAction.backgroundColor,
          showTamil: callToAction.showTamil ?? true,
        }
      : undefined,
  };

  let settings;

  // ===============================
  // UPDATE if exists
  // ===============================
  if (existing) {
    settings = await CustomerPortalSettings.findOneAndUpdate(
      { company: companyId },
      { $set: payload },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    // ===============================
    // CREATE new settings
    // ===============================
    settings = await CustomerPortalSettings.create({
      company: companyId,
      ...payload,
    });
  }

  // ===============================
  // RESPONSE
  // ===============================
  res.status(201).json(settings);
});
export const getPublicPortalSettings = asyncHandler(async (req, res) => {
  let { companyId } = req.params;

  if (!companyId) {
    res.status(400);
    throw new Error("Company identifier is required");
  }

  companyId = companyId.trim();

  let company = null;

  // Search by ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(companyId)) {
    company = await Company.findById(companyId)
      .select("_id name slug")
      .lean();
  }

  // Search by slug
  if (!company) {
    company = await Company.findOne({
      slug: companyId.toLowerCase(),
    })
      .select("_id name slug")
      .lean();
  }

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  const settings = await CustomerPortalSettings.findOne({
    company: company._id,
  }).lean();

  if (!settings) {
    res.status(404);
    throw new Error("Customer portal is not configured.");
  }

  res.status(200).json({
    company,
    settings,
  });
});

export const getPortalSettings = asyncHandler(async (req, res) => {
  let settings = await CustomerPortalSettings.findOne({
    company: req.user.company,
  });

  // If no settings exist, return a safe default object
  if (!settings) {
    return res.json({
      company: req.user.company,

      portalTitle: "",
      portalSubtitle: "",
      heroImage: "",
      companyLogo: "",

      primaryColor: "#0d6efd",
      secondaryColor: "#6c757d",

      contactPhone: "",
      whatsappPhone: "",
      supportEmail: "",
      website: "",

      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",

      businessHours: {},

      welcomeMessage: "",
      serviceRequestInstructions: "",
      emergencyContactMessage: "",

      facebookUrl: "",
      instagramUrl: "",
      youtubeUrl: "",
      linkedinUrl: "",

      enableRegistration: true,
      enableTestimonials: true,
      enableWhatsappButton: true,

      services: [],
      specialServices: [],
      announcements: [],

      // ✅ NEW CTA DEFAULT STRUCTURE
      callToAction: {
        enabled: true,
        title: "",
        titleTamil: "",
        description: "",
        descriptionTamil: "",
        buttonText: "Raise Service Request",
        buttonTextTamil: "",
        icon: "FaHeadset",
        backgroundColor: "#ffffff",
        showTamil: true,
      },
    });
  }

  // Ensure callToAction always exists (prevents frontend crashes)
  const safeSettings = settings.toObject();

  safeSettings.callToAction = {
    enabled: true,
    title: "",
    titleTamil: "",
    description: "",
    descriptionTamil: "",
    buttonText: "Raise Service Request",
    buttonTextTamil: "",
    icon: "FaHeadset",
    backgroundColor: "#ffffff",
    showTamil: true,
    ...(safeSettings.callToAction || {}),
  };

  res.json(safeSettings);
});

export const updatePortalSettings = asyncHandler(async (req, res) => {
  const settings = await CustomerPortalSettings.findOne({
    company: req.user.company,
  });

  if (!settings) {
    res.status(404);
    throw new Error("Portal settings not found");
  }

  const {
    portalTitle,
    portalSubtitle,
    heroImage,
    companyLogo,
    primaryColor,
    secondaryColor,

    contactPhone,
    whatsappPhone,
    supportEmail,
    website,

    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    country,

    businessHours,

    welcomeMessage,
    serviceRequestInstructions,
    emergencyContactMessage,

    facebookUrl,
    instagramUrl,
    youtubeUrl,
    linkedinUrl,

    enableRegistration,
    enableTestimonials,
    enableWhatsappButton,

    services,
    specialServices,
    announcements,

    // ✅ NEW CTA FIELD
    callToAction,
  } = req.body;

  // =========================
  // Update only allowed fields
  // =========================
  settings.portalTitle = portalTitle ?? settings.portalTitle;
  settings.portalSubtitle = portalSubtitle ?? settings.portalSubtitle;
  settings.heroImage = heroImage ?? settings.heroImage;
  settings.companyLogo = companyLogo ?? settings.companyLogo;

  settings.primaryColor = primaryColor ?? settings.primaryColor;
  settings.secondaryColor = secondaryColor ?? settings.secondaryColor;

  settings.contactPhone = contactPhone ?? settings.contactPhone;
  settings.whatsappPhone = whatsappPhone ?? settings.whatsappPhone;
  settings.supportEmail = supportEmail ?? settings.supportEmail;
  settings.website = website ?? settings.website;

  settings.addressLine1 = addressLine1 ?? settings.addressLine1;
  settings.addressLine2 = addressLine2 ?? settings.addressLine2;
  settings.city = city ?? settings.city;
  settings.state = state ?? settings.state;
  settings.zipCode = zipCode ?? settings.zipCode;
  settings.country = country ?? settings.country;

  settings.businessHours = businessHours ?? settings.businessHours;

  settings.welcomeMessage = welcomeMessage ?? settings.welcomeMessage;
  settings.serviceRequestInstructions =
    serviceRequestInstructions ?? settings.serviceRequestInstructions;
  settings.emergencyContactMessage =
    emergencyContactMessage ?? settings.emergencyContactMessage;

  settings.facebookUrl = facebookUrl ?? settings.facebookUrl;
  settings.instagramUrl = instagramUrl ?? settings.instagramUrl;
  settings.youtubeUrl = youtubeUrl ?? settings.youtubeUrl;
  settings.linkedinUrl = linkedinUrl ?? settings.linkedinUrl;

  settings.enableRegistration =
    enableRegistration ?? settings.enableRegistration;
  settings.enableTestimonials =
    enableTestimonials ?? settings.enableTestimonials;
  settings.enableWhatsappButton =
    enableWhatsappButton ?? settings.enableWhatsappButton;

  settings.services = services ?? settings.services;
  settings.specialServices = specialServices ?? settings.specialServices;
  settings.announcements = announcements ?? settings.announcements;

  // =========================
  // NEW: CTA (SAFE MERGE)
  // =========================
  if (callToAction) {
    settings.callToAction = {
      enabled:
        callToAction.enabled ?? settings.callToAction?.enabled ?? true,

      title: callToAction.title ?? settings.callToAction?.title ?? "",
      titleTamil:
        callToAction.titleTamil ?? settings.callToAction?.titleTamil ?? "",

      description:
        callToAction.description ??
        settings.callToAction?.description ??
        "",

      descriptionTamil:
        callToAction.descriptionTamil ??
        settings.callToAction?.descriptionTamil ??
        "",

      buttonText:
        callToAction.buttonText ??
        settings.callToAction?.buttonText ??
        "Raise Service Request",

      buttonTextTamil:
        callToAction.buttonTextTamil ??
        settings.callToAction?.buttonTextTamil ??
        "",

      icon:
        callToAction.icon ??
        settings.callToAction?.icon ??
        "FaHeadset",

      backgroundColor:
        callToAction.backgroundColor ??
        settings.callToAction?.backgroundColor ??
        "#ffffff",

      showTamil:
        callToAction.showTamil ??
        settings.callToAction?.showTamil ??
        true,
    };
  }

  const updated = await settings.save();

  res.json(updated);
});
/**
 * @desc    Get active announcements for a company portal
 * @route   GET /api/portal/:slug/announcements
 * @access  Public
 */
export const getPortalAnnouncements = asyncHandler(async (req, res) => {
  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  // ===============================
  // Validate company
  // ===============================
  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  // ===============================
  // Fetch portal settings
  // ===============================
  const portal = await CustomerPortalSettings.findOne({
    company: companyId,
  }).lean();

  if (!portal) {
    res.status(404);
    throw new Error("Portal settings not found");
  }

  // ===============================
  // Filter active + valid date announcements
  // ===============================
  const now = new Date();

  const announcements = (portal.announcements || [])
    .filter((a) => {
      if (!a.active) return false;

      const startOk =
        !a.startDate || new Date(a.startDate) <= now;

      const endOk =
        !a.endDate || new Date(a.endDate) >= now;

      return startOk && endOk;
    })
    .sort(
      (a, b) =>
        new Date(b.startDate || 0) -
        new Date(a.startDate || 0)
    );

  // ===============================
  // Response
  // ===============================
  res.json({
    count: announcements.length,
    announcements,
  });
});
export const addService = asyncHandler(
  async (req, res) => {
    const settings =
      await CustomerPortalSettings.findOne({
        company: req.user.company,
      });

    if (!settings) {
      res.status(404);
      throw new Error(
        "Portal settings not found"
      );
    }

    settings.services.push({
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      displayOrder:
        req.body.displayOrder || 0,
    });

    await settings.save();

    res.status(201).json(settings.services);
  }
);

export const updateService = asyncHandler(
  async (req, res) => {
    const settings =
      await CustomerPortalSettings.findOne({
        company: req.user.company,
      });

    if (!settings) {
      res.status(404);
      throw new Error(
        "Portal settings not found"
      );
    }

    const service = settings.services.id(
      req.params.serviceId
    );

    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }

    service.title =
      req.body.title ?? service.title;

    service.description =
      req.body.description ??
      service.description;

    service.image =
      req.body.image ?? service.image;

    service.displayOrder =
      req.body.displayOrder ??
      service.displayOrder;

    service.active =
      req.body.active ?? service.active;

    await settings.save();

    res.json(service);
  }
);

export const deleteService = asyncHandler(
  async (req, res) => {
    const settings =
      await CustomerPortalSettings.findOne({
        company: req.user.company,
      });

    if (!settings) {
      res.status(404);
      throw new Error(
        "Portal settings not found"
      );
    }

    settings.services =
      settings.services.filter(
        (service) =>
          service._id.toString() !==
          req.params.serviceId
      );

    await settings.save();

    res.json({
      message: "Service removed",
    });
  }
);

export const addSpecialService =
  asyncHandler(async (req, res) => {
    const settings =
      await CustomerPortalSettings.findOne({
        company: req.user.company,
      });

    settings.specialServices.push({
      title: req.body.title,
      description:
        req.body.description,
      icon: req.body.icon,
    });

    await settings.save();

    res.status(201).json(
      settings.specialServices
    );
  });

  export const updateSpecialService =
  asyncHandler(async (req, res) => {
    const settings =
      await CustomerPortalSettings.findOne({
        company: req.user.company,
      });

    const service =
      settings.specialServices.id(
        req.params.id
      );

    if (!service) {
      res.status(404);
      throw new Error(
        "Special service not found"
      );
    }

    Object.assign(service, req.body);

    await settings.save();

    res.json(service);
  });

  export const deleteSpecialService =
  asyncHandler(async (req, res) => {
    const settings =
      await CustomerPortalSettings.findOne({
        company: req.user.company,
      });

    settings.specialServices =
      settings.specialServices.filter(
        (s) =>
          s._id.toString() !==
          req.params.id
      );

    await settings.save();

    res.json({
      message:
        "Special service deleted",
    });
  });

  export const addAnnouncement =
  asyncHandler(async (req, res) => {
    const settings =
      await CustomerPortalSettings.findOne({
        company: req.user.company,
      });

    settings.announcements.push({
      title: req.body.title,
      message: req.body.message,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });

    await settings.save();

    res.status(201).json(
      settings.announcements
    );
  });
  /**
   * 
 
 
  * @desc Create or update portal settings for a company
 * @route POST /api/customerportals
 * @access Private (Admin / Manager)
 */
export const getAnnouncementById = asyncHandler(async (req, res) => {
  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  const { id } = req.params;

  // ===============================
  // Validate company
  // ===============================
  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  // ===============================
  // Get portal settings
  // ===============================
  const settings = await CustomerPortalSettings.findOne({
    company: companyId,
  });

  if (!settings) {
    res.status(404);
    throw new Error("Portal settings not found");
  }

  // ===============================
  // Find announcement
  // ===============================
  const announcement = settings.announcements.id(id);

  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  // ===============================
  // Response
  // ===============================
  res.json(announcement);
});

/**
 * @desc Update a single announcement inside portal settings
 * @route PUT /api/customerportals/:companyId/announcement/:announcementId
 * @access Private (Admin / Manager)
 */
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { companyId, announcementId } = req.params;

  const {
    title,
    message,
    startDate,
    endDate,
    active,
  } = req.body;

  // ===============================
  // 1. Find portal settings
  // ===============================
  const portal = await CustomerPortalSettings.findOne({
    company: companyId,
  });

  if (!portal) {
    res.status(404);
    throw new Error("Portal settings not found");
  }

  // ===============================
  // 2. Find announcement
  // ===============================
  const announcement = portal.announcements.id(announcementId);

  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  // ===============================
  // 3. Update fields
  // ===============================
  if (title !== undefined) announcement.title = title;
  if (message !== undefined) announcement.message = message;
  if (startDate !== undefined) announcement.startDate = startDate;
  if (endDate !== undefined) announcement.endDate = endDate;
  if (active !== undefined) announcement.active = active;

  // ===============================
  // 4. Save document
  // ===============================
  await portal.save();

  res.json({
    message: "Announcement updated successfully",
    announcement,
  });
});

  export const deleteAnnouncement =
  asyncHandler(async (req, res) => {
    const settings =
      await CustomerPortalSettings.findOne({
        company: req.user.company,
      });

    settings.announcements =
      settings.announcements.filter(
        (a) =>
          a._id.toString() !==
          req.params.id
      );

    await settings.save();

    res.json({
      message:
        "Announcement deleted",
    });
  });