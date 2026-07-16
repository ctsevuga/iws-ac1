import mongoose from "mongoose";

const customerPortalSettingsSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },

    // ================= Portal Branding =================
    portalTitle: String,
    portalSubtitle: String,
    heroImage: String,
    companyLogo: String,

    primaryColor: String,
    secondaryColor: String,

    // ================= Contact Information =================
    contactPhone: String,
    whatsappPhone: String,
    supportEmail: String,
    website: String,

    // ================= Address =================
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,

    // ================= Business Hours =================
    businessHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },

    // ================= Hero Content =================
    welcomeMessage: String,
    serviceRequestInstructions: String,
    emergencyContactMessage: String,

    // ================= Call To Action =================
    callToAction: {
      enabled: {
        type: Boolean,
        default: true,
      },

      title: {
        type: String,
        default: "Need Assistance? We're Here to Help!",
      },

      description: {
        type: String,
        default:
          "Simply register your service request or contact us via Call / WhatsApp with your complete service details. Our dedicated team is committed to providing prompt, reliable, and professional support, ensuring your service needs are handled with the highest level of care and to your complete satisfaction.",
      },

      titleTamil: {
        type: String,
        default: "உதவி தேவையா? நாங்கள் உங்களுக்காக இருக்கிறோம்!",
      },

      descriptionTamil: {
        type: String,
        default:
          "உங்கள் சேவைத் தேவைகளின் முழு விவரங்களுடன் உங்கள் சேவை கோரிக்கையை பதிவு செய்யுங்கள் அல்லது எங்கள் அழைப்பு / வாட்ஸ்அப் எண்ணை தொடர்பு கொள்ளுங்கள். எங்கள் அனுபவமிக்க குழு, உங்கள் கோரிக்கையை விரைவாகவும், நம்பகத்தன்மையுடனும், தொழில்முறை தரத்திலும் நிறைவேற்றி, உங்கள் முழுமையான திருப்தியை உறுதி செய்ய அர்ப்பணிப்புடன் செயல்படும்.",
      },

      buttonText: {
        type: String,
        default: "Raise Service Request",
      },

      buttonTextTamil: {
        type: String,
        default: "சேவை கோரிக்கையை பதிவு செய்யுங்கள்",
      },

      icon: {
        type: String,
        default: "FaHeadset",
      },

      backgroundColor: {
        type: String,
        default: "#F8F9FA",
      },

      showTamil: {
        type: Boolean,
        default: true,
      },
    },

    // ================= Social Media =================
    facebookUrl: String,
    instagramUrl: String,
    youtubeUrl: String,
    linkedinUrl: String,

    // ================= Portal Features =================
    enableRegistration: {
      type: Boolean,
      default: true,
    },

    enableTestimonials: {
      type: Boolean,
      default: true,
    },

    enableWhatsappButton: {
      type: Boolean,
      default: true,
    },

    // ================= Services =================
    services: [
      {
        title: String,
        description: String,
        image: String,
        displayOrder: Number,
        active: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // ================= Special Services =================
    specialServices: [
      {
        title: String,
        description: String,
        icon: String,
        active: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // ================= Announcements =================
    announcements: [
      {
        title: String,
        message: String,
        startDate: Date,
        endDate: Date,
        active: {
          type: Boolean,
          default: true,
        },
      },
    ],
    // ================= FAQs =================
faqs: [
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    questionTamil: {
      type: String,
      trim: true,
    },

    answerTamil: {
      type: String,
      trim: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "CustomerPortalSettings",
  customerPortalSettingsSchema
);