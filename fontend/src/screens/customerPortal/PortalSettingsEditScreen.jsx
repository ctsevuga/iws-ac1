import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

import {
  useGetPortalSettingsQuery,
  useUpdatePortalSettingsMutation,
} from "../../slices/customerPortalApiSlice";

const PortalSettingsEditScreen = () => {
  const navigate = useNavigate();
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useGetPortalSettingsQuery();

  const [
    updatePortalSettings,
    {
      isLoading: loadingUpdate,
      error: updateError,
    },
  ] = useUpdatePortalSettingsMutation();

  // =====================================================
  // FORM STATE
  // =====================================================

  const [portalTitle, setPortalTitle] =
    useState("");

  const [portalSubtitle, setPortalSubtitle] =
    useState("");

  const [heroImage, setHeroImage] =
    useState("");

  const [companyLogo, setCompanyLogo] =
    useState("");

  const [primaryColor, setPrimaryColor] =
    useState("#0d6efd");

  const [secondaryColor, setSecondaryColor] =
    useState("#6c757d");

  const [contactPhone, setContactPhone] =
    useState("");

  const [whatsappPhone, setWhatsappPhone] =
    useState("");

  const [supportEmail, setSupportEmail] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [addressLine1, setAddressLine1] =
    useState("");

  const [addressLine2, setAddressLine2] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [zipCode, setZipCode] =
    useState("");

  const [country, setCountry] =
    useState("");
  const [ctaEnabled, setCtaEnabled] = useState(true);
const [ctaTitle, setCtaTitle] = useState("");
const [ctaTitleTamil, setCtaTitleTamil] = useState("");
const [ctaDescription, setCtaDescription] = useState("");
const [ctaDescriptionTamil, setCtaDescriptionTamil] = useState("");
const [ctaButtonText, setCtaButtonText] = useState("Raise Service Request");
const [ctaButtonTextTamil, setCtaButtonTextTamil] = useState("");
const [ctaIcon, setCtaIcon] = useState("FaHeadset");
const [ctaBackgroundColor, setCtaBackgroundColor] = useState("#ffffff");
const [ctaShowTamil, setCtaShowTamil] = useState(true);  

  const [
    welcomeMessage,
    setWelcomeMessage,
  ] = useState("");

  const [
    serviceRequestInstructions,
    setServiceRequestInstructions,
  ] = useState("");

  const [
    emergencyContactMessage,
    setEmergencyContactMessage,
  ] = useState("");

  const [facebookUrl, setFacebookUrl] =
    useState("");

  const [instagramUrl, setInstagramUrl] =
    useState("");

  const [youtubeUrl, setYoutubeUrl] =
    useState("");

  const [linkedinUrl, setLinkedinUrl] =
    useState("");

  const [
    enableRegistration,
    setEnableRegistration,
  ] = useState(true);

  const [
    enableTestimonials,
    setEnableTestimonials,
  ] = useState(true);

  const [
    enableWhatsappButton,
    setEnableWhatsappButton,
  ] = useState(true);

  const [businessHours, setBusinessHours] =
    useState({});

  const [services, setServices] =
    useState([]);

  const [
    specialServices,
    setSpecialServices,
  ] = useState([]);

  const [
    announcements,
    setAnnouncements,
  ] = useState([]);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
  if (!settings) return;

  // existing fields...

  setEnableRegistration(settings.enableRegistration ?? true);
  setEnableTestimonials(settings.enableTestimonials ?? true);
  setEnableWhatsappButton(settings.enableWhatsappButton ?? true);

  setServices(settings.services || []);
  setSpecialServices(settings.specialServices || []);
  setAnnouncements(settings.announcements || []);

  // ✅ CTA LOAD FIX
  const cta = settings.callToAction;

  if (cta) {
    setCtaEnabled(cta.enabled ?? true);
    setCtaTitle(cta.title || "");
    setCtaTitleTamil(cta.titleTamil || "");
    setCtaDescription(cta.description || "");
    setCtaDescriptionTamil(cta.descriptionTamil || "");
    setCtaButtonText(cta.buttonText || "Raise Service Request");
    setCtaButtonTextTamil(cta.buttonTextTamil || "");
    setCtaIcon(cta.icon || "FaHeadset");
    setCtaBackgroundColor(cta.backgroundColor || "#ffffff");
    setCtaShowTamil(cta.showTamil ?? true);
  }
}, [settings]);

  // =====================================================
  // SERVICES
  // =====================================================

  const addService = () => {
    setServices([
      ...services,
      {
        title: "",
        description: "",
        image: "",
        displayOrder:
          services.length + 1,
        active: true,
      },
    ]);
  };

  const updateService = (
    index,
    field,
    value
  ) => {
    const updated = [...services];

    updated[index][field] = value;

    setServices(updated);
  };

  const removeService = (index) => {
    setServices(
      services.filter(
        (_, i) => i !== index
      )
    );
  };

  // =====================================================
  // SPECIAL SERVICES
  // =====================================================

  const addSpecialService = () => {
    setSpecialServices([
      ...specialServices,
      {
        title: "",
        description: "",
        icon: "",
        active: true,
      },
    ]);
  };

  const updateSpecialService = (
    index,
    field,
    value
  ) => {
    const updated = [
      ...specialServices,
    ];

    updated[index][field] = value;

    setSpecialServices(updated);
  };

  // =====================================================
  // ANNOUNCEMENTS
  // =====================================================

  const addAnnouncement = () => {
    setAnnouncements([
      ...announcements,
      {
        title: "",
        message: "",
        startDate: "",
        endDate: "",
        active: true,
      },
    ]);
  };

  const updateAnnouncement = (
    index,
    field,
    value
  ) => {
    const updated = [
      ...announcements,
    ];

    updated[index][field] = value;

    setAnnouncements(updated);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updatePortalSettings({
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

  // ✅ CTA ADDED
  callToAction: {
    enabled: ctaEnabled,
    title: ctaTitle,
    titleTamil: ctaTitleTamil,
    description: ctaDescription,
    descriptionTamil: ctaDescriptionTamil,
    buttonText: ctaButtonText,
    buttonTextTamil: ctaButtonTextTamil,
    icon: ctaIcon,
    backgroundColor: ctaBackgroundColor,
    showTamil: ctaShowTamil,
  },
}).unwrap();

      toast.success(
        "Portal settings updated"
      );

      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Update failed"
      );
    }
  };

  if (isLoading) return <Loader />;

  return (
    <Row className="justify-content-center">
      <Col lg={10}>
        <Card className="shadow-sm">
          <Card.Body>
            <h2 className="mb-4">
              Edit Customer Portal Settings
            </h2>

            {error && (
              <Message variant="danger">
                {error?.data?.message}
              </Message>
            )}

            {updateError && (
              <Message variant="danger">
                {
                  updateError?.data
                    ?.message
                }
              </Message>
            )}

            <Form onSubmit={submitHandler}>
              {/* Portal */}

              <Form.Group className="mb-3">
                <Form.Label>
                  Portal Title
                </Form.Label>
                <Form.Control
                  value={portalTitle}
                  onChange={(e) =>
                    setPortalTitle(
                      e.target.value
                    )
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Portal Subtitle
                </Form.Label>
                <Form.Control
                  value={
                    portalSubtitle
                  }
                  onChange={(e) =>
                    setPortalSubtitle(
                      e.target.value
                    )
                  }
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Hero Image
                    </Form.Label>
                    <Form.Control
                      value={heroImage}
                      onChange={(e) =>
                        setHeroImage(
                          e.target.value
                        )
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Company Logo
                    </Form.Label>
                    <Form.Control
                      value={companyLogo}
                      onChange={(e) =>
                        setCompanyLogo(
                          e.target.value
                        )
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Contact Phone
                    </Form.Label>
                    <Form.Control
                      value={
                        contactPhone
                      }
                      onChange={(e) =>
                        setContactPhone(
                          e.target.value
                        )
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      WhatsApp
                    </Form.Label>
                    <Form.Control
                      value={
                        whatsappPhone
                      }
                      onChange={(e) =>
                        setWhatsappPhone(
                          e.target.value
                        )
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* FEATURE FLAGS */}

              <Form.Check
                className="mb-2"
                type="switch"
                label="Enable Registration"
                checked={
                  enableRegistration
                }
                onChange={(e) =>
                  setEnableRegistration(
                    e.target.checked
                  )
                }
              />

              <Form.Check
                className="mb-2"
                type="switch"
                label="Enable Testimonials"
                checked={
                  enableTestimonials
                }
                onChange={(e) =>
                  setEnableTestimonials(
                    e.target.checked
                  )
                }
              />

              <Form.Check
                className="mb-4"
                type="switch"
                label="Enable WhatsApp Button"
                checked={
                  enableWhatsappButton
                }
                onChange={(e) =>
                  setEnableWhatsappButton(
                    e.target.checked
                  )
                }
              />

              <h4 className="mt-4">Call To Action (CTA)</h4>

<Form.Check
  type="switch"
  label="Enable CTA"
  checked={ctaEnabled}
  onChange={(e) => setCtaEnabled(e.target.checked)}
/>

<Row>
  <Col md={6}>
    <Form.Group className="mb-2">
      <Form.Label>Title</Form.Label>
      <Form.Control
        value={ctaTitle}
        onChange={(e) => setCtaTitle(e.target.value)}
      />
    </Form.Group>
  </Col>

  <Col md={6}>
    <Form.Group className="mb-2">
      <Form.Label>Title (Tamil)</Form.Label>
      <Form.Control
        value={ctaTitleTamil}
        onChange={(e) => setCtaTitleTamil(e.target.value)}
      />
    </Form.Group>
  </Col>
</Row>

<Form.Group className="mb-2">
  <Form.Label>Description</Form.Label>
  <Form.Control
    as="textarea"
    rows={3}
    value={ctaDescription}
    onChange={(e) => setCtaDescription(e.target.value)}
  />
</Form.Group>

<Form.Group className="mb-2">
  <Form.Label>Description (Tamil)</Form.Label>
  <Form.Control
    as="textarea"
    rows={3}
    value={ctaDescriptionTamil}
    onChange={(e) => setCtaDescriptionTamil(e.target.value)}
  />
</Form.Group>

<Row>
  <Col md={6}>
    <Form.Group className="mb-2">
      <Form.Label>Button Text</Form.Label>
      <Form.Control
        value={ctaButtonText}
        onChange={(e) => setCtaButtonText(e.target.value)}
      />
    </Form.Group>
  </Col>

  <Col md={6}>
    <Form.Group className="mb-2">
      <Form.Label>Button Text (Tamil)</Form.Label>
      <Form.Control
        value={ctaButtonTextTamil}
        onChange={(e) => setCtaButtonTextTamil(e.target.value)}
      />
    </Form.Group>
  </Col>
</Row>

<Row>
  <Col md={6}>
    <Form.Group className="mb-2">
      <Form.Label>Icon</Form.Label>
      <Form.Control
        value={ctaIcon}
        onChange={(e) => setCtaIcon(e.target.value)}
      />
    </Form.Group>
  </Col>

  <Col md={6}>
    <Form.Group className="mb-2">
      <Form.Label>Background Color</Form.Label>
      <Form.Control
        type="color"
        value={ctaBackgroundColor}
        onChange={(e) => setCtaBackgroundColor(e.target.value)}
      />
    </Form.Group>
  </Col>
</Row>

<Form.Check
  type="switch"
  label="Show Tamil"
  checked={ctaShowTamil}
  onChange={(e) => setCtaShowTamil(e.target.checked)}
/>

              {/* SERVICES */}

              <div className="d-flex justify-content-between mb-3">
                <h4>Services</h4>

                <Button
                  size="sm"
                  onClick={addService}
                >
                  Add Service
                </Button>
              </div>

              {services.map(
                (
                  service,
                  index
                ) => (
                  <Card
                    key={index}
                    className="mb-3"
                  >
                    <Card.Body>
                      <Form.Control
                        className="mb-2"
                        placeholder="Title"
                        value={
                          service.title
                        }
                        onChange={(e) =>
                          updateService(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />

                      <Form.Control
                        as="textarea"
                        placeholder="Description"
                        value={
                          service.description
                        }
                        onChange={(e) =>
                          updateService(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />

                      <Button
                        variant="danger"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          removeService(
                            index
                          )
                        }
                      >
                        Remove
                      </Button>
                    </Card.Body>
                  </Card>
                )
              )}

              <Button
                type="submit"
                disabled={
                  loadingUpdate
                }
              >
                Update Settings
              </Button>

              {loadingUpdate && (
                <Loader />
              )}
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <div className="mt-4">
  <Button
    className="w-100"
    size="lg"
    variant="primary"
    onClick={() => navigate("/announcementList")}
  >
    View Announcements
  </Button>
</div>
    </Row>
    
  );
};

export default PortalSettingsEditScreen;