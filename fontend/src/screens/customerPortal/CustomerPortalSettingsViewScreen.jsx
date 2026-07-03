import React from "react";
import { Row, Col, Button, Card, Badge, ListGroup } from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

import { useGetPortalSettingsQuery } from "../../slices/customerPortalApiSlice";

const CustomerPortalSettingsViewScreen = () => {
  const navigate = useNavigate();
  const { data: settings, isLoading, error } = useGetPortalSettingsQuery();

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <Message variant="danger">
        {error?.data?.message || "Failed to load portal settings"}
      </Message>
    );
  }

  if (!settings) {
    return <Message variant="info">No portal settings found.</Message>;
  }

  return (
    <Row className="justify-content-center">
      <Col lg={10}>
        {/* HEADER */}

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={3}>
                {settings.companyLogo && (
                  <img
                    src={settings.companyLogo}
                    alt="Company Logo"
                    className="img-fluid"
                  />
                )}
              </Col>

              <Col md={9}>
                <h2>{settings.portalTitle}</h2>

                <p className="text-muted">{settings.portalSubtitle}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* HERO IMAGE */}

        {settings.heroImage && (
          <Card className="mb-4">
            <Card.Img src={settings.heroImage} alt="Hero" />
          </Card>
        )}

        {/* BRANDING */}

        <Card className="mb-4">
          <Card.Header>Branding</Card.Header>

          <Card.Body>
            <p>
              <strong>Primary Color:</strong> {settings.primaryColor}
            </p>

            <p>
              <strong>Secondary Color:</strong> {settings.secondaryColor}
            </p>
          </Card.Body>
        </Card>

        {/* CONTACT */}

        <Card className="mb-4">
          <Card.Header>Contact Information</Card.Header>

          <Card.Body>
            <p>
              <strong>Phone:</strong> {settings.contactPhone}
            </p>

            <p>
              <strong>WhatsApp:</strong> {settings.whatsappPhone}
            </p>

            <p>
              <strong>Email:</strong> {settings.supportEmail}
            </p>

            <p>
              <strong>Website:</strong> {settings.website}
            </p>
          </Card.Body>
        </Card>

        {/* ADDRESS */}

        <Card className="mb-4">
          <Card.Header>Address</Card.Header>

          <Card.Body>
            <p>{settings.addressLine1}</p>

            <p>{settings.addressLine2}</p>

            <p>
              {settings.city}, {settings.state}
            </p>

            <p>{settings.zipCode}</p>

            <p>{settings.country}</p>
          </Card.Body>
        </Card>

        {/* MESSAGES */}

        <Card className="mb-4">
          <Card.Header>Portal Messages</Card.Header>

          <Card.Body>
            <h6>Welcome Message</h6>

            <p>{settings.welcomeMessage}</p>

            <hr />

            <h6>Service Request Instructions</h6>

            <p>{settings.serviceRequestInstructions}</p>

            <hr />

            <h6>Emergency Contact Message</h6>

            <p>{settings.emergencyContactMessage}</p>
          </Card.Body>
        </Card>

        {/* SERVICES */}

        <Card className="mb-4">
          <Card.Header>Services</Card.Header>

          <ListGroup variant="flush">
            {settings.services?.map((service) => (
              <ListGroup.Item key={service._id}>
                <Row>
                  <Col md={3}>
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="img-fluid rounded"
                      />
                    )}
                  </Col>

                  <Col md={9}>
                    <h5>{service.title}</h5>

                    <p>{service.description}</p>

                    <Badge bg={service.active ? "success" : "secondary"}>
                      {service.active ? "Active" : "Inactive"}
                    </Badge>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>

        {/* SPECIAL SERVICES */}

        <Card className="mb-4">
          <Card.Header>Special Services</Card.Header>

          <ListGroup variant="flush">
            {settings.specialServices?.map((service) => (
              <ListGroup.Item key={service._id}>
                <h5>
                  {service.icon} {service.title}
                </h5>

                <p>{service.description}</p>

                <Badge bg={service.active ? "success" : "secondary"}>
                  {service.active ? "Active" : "Inactive"}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>

        {/* ANNOUNCEMENTS */}

        <Card className="mb-4">
          <Card.Header>Announcements</Card.Header>

          <ListGroup variant="flush">
            {settings.announcements?.map((announcement) => (
              <ListGroup.Item key={announcement._id}>
                <h5>{announcement.title}</h5>

                <p>{announcement.message}</p>

                <small>
                  {announcement.startDate
                    ? new Date(announcement.startDate).toLocaleDateString()
                    : "-"}
                  {" - "}
                  {announcement.endDate
                    ? new Date(announcement.endDate).toLocaleDateString()
                    : "-"}
                </small>

                <div className="mt-2">
                  <Badge bg={announcement.active ? "success" : "secondary"}>
                    {announcement.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
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
        {/* CTA SECTION */}
        {settings.callToAction && (
          <Card className="mb-4">
            <Card.Header>Call To Action (CTA)</Card.Header>

            <Card.Body>
              <h4>
                {settings.callToAction.icon} {settings.callToAction.title}
              </h4>

              {settings.callToAction.titleTamil && (
                <p className="text-muted">{settings.callToAction.titleTamil}</p>
              )}

              <p>{settings.callToAction.description}</p>

              {settings.callToAction.descriptionTamil && (
                <p className="text-muted">
                  {settings.callToAction.descriptionTamil}
                </p>
              )}

              <div className="mb-2">
                <strong>Button:</strong> {settings.callToAction.buttonText}
              </div>

              {settings.callToAction.buttonTextTamil && (
                <div className="mb-2 text-muted">
                  {settings.callToAction.buttonTextTamil}
                </div>
              )}

              <div className="mb-2">
                <strong>Background Color:</strong>{" "}
                <span
                  style={{
                    background: settings.callToAction.backgroundColor,
                    padding: "4px 10px",
                    borderRadius: "4px",
                    color: "#000",
                    marginLeft: "6px",
                  }}
                >
                  {settings.callToAction.backgroundColor}
                </span>
              </div>

              <Badge
                bg={settings.callToAction.enabled ? "success" : "secondary"}
              >
                {settings.callToAction.enabled ? "CTA Enabled" : "CTA Disabled"}
              </Badge>

              <Badge
                bg={settings.callToAction.showTamil ? "info" : "secondary"}
                className="ms-2"
              >
                Tamil: {settings.callToAction.showTamil ? "ON" : "OFF"}
              </Badge>
            </Card.Body>
          </Card>
        )}
        {/* SOCIAL LINKS */}

        <Card className="mb-4">
          <Card.Header>Social Media</Card.Header>

          <Card.Body>
            <p>
              <strong>Facebook:</strong> {settings.facebookUrl}
            </p>

            <p>
              <strong>Instagram:</strong> {settings.instagramUrl}
            </p>

            <p>
              <strong>YouTube:</strong> {settings.youtubeUrl}
            </p>

            <p>
              <strong>LinkedIn:</strong> {settings.linkedinUrl}
            </p>
          </Card.Body>
        </Card>

        {/* FEATURES */}

        <Card>
          <Card.Header>Features</Card.Header>

          <Card.Body>
            <Badge
              bg={settings.enableRegistration ? "success" : "secondary"}
              className="me-2"
            >
              Registration
            </Badge>

            <Badge
              bg={settings.enableTestimonials ? "success" : "secondary"}
              className="me-2"
            >
              Testimonials
            </Badge>

            <Badge bg={settings.enableWhatsappButton ? "success" : "secondary"}>
              WhatsApp Button
            </Badge>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CustomerPortalSettingsViewScreen;
