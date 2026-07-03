import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import { useCreatePortalSettingsMutation } from "../../slices/customerPortalApiSlice";

const CustomerPortalSettingsScreen = () => {
  const [createPortalSettings, { isLoading, error }] =
    useCreatePortalSettingsMutation();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [company] = useState(userInfo?.company || "");

  // Branding
  const [portalTitle, setPortalTitle] = useState("");
  const [portalSubtitle, setPortalSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#0d6efd");

  const [secondaryColor, setSecondaryColor] = useState("#6c757d");

  // Contact
  const [contactPhone, setContactPhone] = useState("");

  const [whatsappPhone, setWhatsappPhone] = useState("");

  const [supportEmail, setSupportEmail] = useState("");

  const [website, setWebsite] = useState("");

  // Address
  const [addressLine1, setAddressLine1] = useState("");

  const [addressLine2, setAddressLine2] = useState("");

  const [city, setCity] = useState("");

  const [state, setState] = useState("");

  const [zipCode, setZipCode] = useState("");

  const [country, setCountry] = useState("");

  // Messages
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const [serviceRequestInstructions, setServiceRequestInstructions] =
    useState("");

  const [emergencyContactMessage, setEmergencyContactMessage] = useState("");
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

  // Social
  const [facebookUrl, setFacebookUrl] = useState("");

  const [instagramUrl, setInstagramUrl] = useState("");

  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Toggles
  const [enableRegistration, setEnableRegistration] = useState(true);

  const [enableTestimonials, setEnableTestimonials] = useState(true);

  const [enableWhatsappButton, setEnableWhatsappButton] = useState(true);

  // Business Hours
  const [businessHours, setBusinessHours] = useState({});

  // Dynamic Arrays
  const [services, setServices] = useState([]);

  const [specialServices, setSpecialServices] = useState([]);

  const [announcements, setAnnouncements] = useState([]);

  

  // ===================================
  // SERVICES
  // ===================================

  const addService = () => {
    setServices([
      ...services,
      {
        title: "",
        description: "",
        image: "",
        displayOrder: services.length + 1,
        active: true,
      },
    ]);
  };

  const updateService = (index, field, value) => {
    const updated = [...services];

    updated[index][field] = value;

    setServices(updated);
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // ===================================
  // SPECIAL SERVICES
  // ===================================

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

  const updateSpecialService = (index, field, value) => {
    const updated = [...specialServices];

    updated[index][field] = value;

    setSpecialServices(updated);
  };

  const removeSpecialService = (index) => {
    setSpecialServices(specialServices.filter((_, i) => i !== index));
  };

  // ===================================
  // ANNOUNCEMENTS
  // ===================================

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

  const updateAnnouncement = (index, field, value) => {
    const updated = [...announcements];

    updated[index][field] = value;

    setAnnouncements(updated);
  };

  const removeAnnouncement = (index) => {
    setAnnouncements(announcements.filter((_, i) => i !== index));
  };

  // ===================================
  // SUBMIT
  // ===================================

  const submitHandler = async (e) => {
    e.preventDefault();

    const payload = {
  company,

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

  // ================= NEW CTA =================
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
};

    try {
      const response = await createPortalSettings(payload).unwrap();

      toast.success("Portal settings saved");
    } catch (err) {
      console.error("Mutation Error:", err);

      console.error("Error Data:", err?.data);

      console.error("Error Status:", err?.status);

      toast.error(err?.data?.message || "Failed to save settings");
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg={10}>
        <Card>
          <Card.Body>
            <h2 className="mb-4">Customer Portal Settings</h2>

            {error && (
              <Message variant="danger">{error?.data?.message}</Message>
            )}

            <Form onSubmit={submitHandler}>
              {/* Branding */}

              <h4>Branding</h4>

              <Form.Group className="mb-3">
                <Form.Label>Portal Title</Form.Label>

                <Form.Control
                  value={portalTitle}
                  onChange={(e) => setPortalTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Portal Subtitle</Form.Label>

                <Form.Control
                  value={portalSubtitle}
                  onChange={(e) => setPortalSubtitle(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hero Image URL</Form.Label>

                    <Form.Control
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Logo URL</Form.Label>

                    <Form.Control
                      value={companyLogo}
                      onChange={(e) => setCompanyLogo(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Primary Color</Form.Label>

                    <Form.Control
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Secondary Color</Form.Label>

                    <Form.Control
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Contact */}

              <h4 className="mt-4">Contact</h4>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact Phone</Form.Label>

                    <Form.Control
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>WhatsApp Phone</Form.Label>

                    <Form.Control
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Support Email</Form.Label>

                <Form.Control
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>

                <Form.Control
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </Form.Group>

              {/* Messages */}

              <h4 className="mt-4">Messages</h4>

              <Form.Group className="mb-3">
                <Form.Label>Welcome Message</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Service Instructions</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  value={serviceRequestInstructions}
                  onChange={(e) =>
                    setServiceRequestInstructions(e.target.value)
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Emergency Message</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  value={emergencyContactMessage}
                  onChange={(e) => setEmergencyContactMessage(e.target.value)}
                />
              </Form.Group>

              {/* Toggles */}

              <h4 className="mt-4">Features</h4>

              <Form.Check
                className="mb-2"
                type="switch"
                label="Enable Registration"
                checked={enableRegistration}
                onChange={(e) => setEnableRegistration(e.target.checked)}
              />

              <Form.Check
                className="mb-2"
                type="switch"
                label="Enable Testimonials"
                checked={enableTestimonials}
                onChange={(e) => setEnableTestimonials(e.target.checked)}
              />

              <Form.Check
                className="mb-4"
                type="switch"
                label="Enable WhatsApp Button"
                checked={enableWhatsappButton}
                onChange={(e) => setEnableWhatsappButton(e.target.checked)}
              />
            <h4 className="mt-4">Call To Action (CTA)</h4>

<Form.Check
  type="switch"
  label="Enable CTA Section"
  checked={ctaEnabled}
  onChange={(e) => setCtaEnabled(e.target.checked)}
/>

<Row>
  <Col md={6}>
    <Form.Group className="mb-2">
      <Form.Label>Title (English)</Form.Label>
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
  <Form.Label>Description (English)</Form.Label>
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
      <Form.Label>Button Text (English)</Form.Label>
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
  label="Show Tamil Section"
  checked={ctaShowTamil}
  onChange={(e) => setCtaShowTamil(e.target.checked)}
/>
              {/* Services */}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Services</h4>

                <Button size="sm" onClick={addService}>
                  Add Service
                </Button>
              </div>

              {services.map((service, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Form.Control
                      className="mb-2"
                      placeholder="Title"
                      value={service.title}
                      onChange={(e) =>
                        updateService(index, "title", e.target.value)
                      }
                    />

                    <Card.Body>
                      <Form.Control
                        className="mb-2"
                        placeholder="Title"
                        value={service.title}
                        onChange={(e) =>
                          updateService(index, "title", e.target.value)
                        }
                      />

                      <Form.Control
                        as="textarea"
                        rows={3}
                        className="mb-2"
                        placeholder="Description"
                        value={service.description}
                        onChange={(e) =>
                          updateService(index, "description", e.target.value)
                        }
                      />

                      <Form.Control
                        className="mb-2"
                        placeholder="Image URL"
                        value={service.image}
                        onChange={(e) =>
                          updateService(index, "image", e.target.value)
                        }
                      />

                      {service.image && (
                        <div className="mb-2">
                          <img
                            src={service.image}
                            alt={service.title}
                            style={{
                              maxWidth: "200px",
                              maxHeight: "120px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      )}

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        Remove
                      </Button>
                    </Card.Body>

                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeService(index)}
                    >
                      Remove
                    </Button>
                  </Card.Body>
                </Card>
              ))}

              {/* Special Services */}

              <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
                <h4>Special Services</h4>

                <Button size="sm" onClick={addSpecialService}>
                  Add
                </Button>
              </div>

              {specialServices.map((item, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Form.Control
                      className="mb-2"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) =>
                        updateSpecialService(index, "title", e.target.value)
                      }
                    />

                    <Form.Control
                      placeholder="Icon"
                      value={item.icon}
                      onChange={(e) =>
                        updateSpecialService(index, "icon", e.target.value)
                      }
                    />
                  </Card.Body>
                </Card>
              ))}

              {/* Announcements */}

              <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
                <h4>Announcements</h4>

                <Button size="sm" onClick={addAnnouncement}>
                  Add
                </Button>
              </div>

              {announcements.map((item, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Form.Control
                      className="mb-2"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) =>
                        updateAnnouncement(index, "title", e.target.value)
                      }
                    />

                    <Form.Control
                      as="textarea"
                      className="mb-2"
                      placeholder="Message"
                      value={item.message}
                      onChange={(e) =>
                        updateAnnouncement(index, "message", e.target.value)
                      }
                    />

                    <Row>
                      <Col>
                        <Form.Control
                          type="date"
                          value={item.startDate}
                          onChange={(e) =>
                            updateAnnouncement(
                              index,
                              "startDate",
                              e.target.value,
                            )
                          }
                        />
                      </Col>

                      <Col>
                        <Form.Control
                          type="date"
                          value={item.endDate}
                          onChange={(e) =>
                            updateAnnouncement(index, "endDate", e.target.value)
                          }
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}

              <Button type="submit" disabled={isLoading}>
                Save Settings
              </Button>
              <div className="d-flex justify-content-end mt-4 mb-3">
                <Button
                  variant="outline-primary"
                  onClick={() => (window.location.href = "/announcementList")}
                >
                  Announcements
                </Button>
              </div>
              {isLoading && <Loader />}
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CustomerPortalSettingsScreen;
