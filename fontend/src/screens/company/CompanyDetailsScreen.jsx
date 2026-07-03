import React from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Button,
  ListGroup,
} from "react-bootstrap";

import {
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaArrowLeft,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import { useParams, useNavigate } from "react-router-dom";

import { useGetCompanyDetailsQuery } from "../../slices/companyApiSlice";

const CompanyDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: company,
    isLoading,
    error,
  } = useGetCompanyDetailsQuery(id);

  const getPlanVariant = (plan) => {
    switch (plan) {
      case "enterprise":
        return "dark";
      case "pro":
        return "success";
      case "basic":
        return "primary";
      default:
        return "secondary";
    }
  };

  return (
    <Container className="py-4">
      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold text-primary">
            <FaBuilding className="me-2" />
            Company Details
          </h3>
        </Col>

        <Col className="text-end">
          <Button
            variant="light"
            className="me-2"
            onClick={() => navigate("/companies")}
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>

          <Button
            variant="primary"
            onClick={() => navigate(`/companies/${id}/edit`)}
          >
            <FaEdit className="me-2" />
            Edit
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-danger text-center py-4">
            {error?.data?.message || "Failed to load company"}
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* MAIN INFO */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <div className="d-flex align-items-center mb-3">

                    {/* LOGO */}
                    {company?.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          marginRight: "20px",
                        }}
                      />
                    ) : (
                      <div
                        className="bg-primary text-white d-flex align-items-center justify-content-center"
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "10px",
                          marginRight: "20px",
                          fontSize: "1.8rem",
                        }}
                      >
                        <FaBuilding />
                      </div>
                    )}

                    <div>
                      <h4 className="fw-bold mb-1">{company.name}</h4>

                      {company.legalName && (
                        <div className="text-muted">
                          {company.legalName}
                        </div>
                      )}

                      {/* SLUG / DOMAIN INFO */}
                      <div className="text-muted small mt-1">
                        Slug: <strong>{company.slug}</strong>
                        {company.domain && (
                          <>
                            {" | "}Domain: <strong>{company.domain}</strong>
                          </>
                        )}
                      </div>

                      <div className="mt-2">
                        <Badge
                          bg={getPlanVariant(company.plan)}
                          className="me-2"
                        >
                          {company.plan?.toUpperCase()}
                        </Badge>

                        <Badge bg={company.isActive ? "success" : "danger"}>
                          {company.isActive ? "Active" : "Inactive"}
                        </Badge>

                        {company.subscriptionStatus && (
                          <Badge bg="info" className="ms-2">
                            {company.subscriptionStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* CONTACT */}
                <Col md={4}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FaEnvelope className="me-2 text-primary" />
                      {company.email}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <FaPhone className="me-2 text-success" />
                      {company.phone}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <FaGlobe className="me-2 text-info" />
                      {company.website || "N/A"}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ADDRESS + SUBSCRIPTION */}
          <Row className="mb-4">

            {/* ADDRESS */}
            <Col md={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <h5 className="fw-bold mb-3 text-primary">
                    <FaMapMarkerAlt className="me-2" />
                    Address
                  </h5>

                  <div>{company?.address?.street || "-"}</div>

                  <div>
                    {company?.address?.city}
                    {company?.address?.state &&
                      `, ${company.address.state}`}
                  </div>

                  <div>{company?.address?.pincode || "-"}</div>

                  <div>{company?.address?.country || "-"}</div>
                </Card.Body>
              </Card>
            </Col>

            {/* SUBSCRIPTION */}
            <Col md={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <h5 className="fw-bold mb-3 text-primary">
                    <FaMoneyBillWave className="me-2" />
                    Subscription
                  </h5>

                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Plan:</strong> {company.plan}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Status:</strong> {company.subscriptionStatus}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Trial Ends:</strong>{" "}
                      {company.trialEndsAt
                        ? new Date(company.trialEndsAt).toLocaleDateString()
                        : "N/A"}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <FaClock className="me-2 text-warning" />
                      Timezone: {company.timezone}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      Currency: {company.currency}
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* SETTINGS */}
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="fw-bold mb-4 text-primary">
                Operational Settings
              </h5>

              <Row>
                {[
                  ["allowOnlineBooking", "Allow Online Booking"],
                  ["autoAssignTechnician", "Auto Assign Technician"],
                  ["enableInvoicing", "Enable Invoicing"],
                  ["enablePayments", "Enable Payments"],
                ].map(([key, label]) => (
                  <Col md={6} lg={4} key={key}>
                    <div className="mb-3">
                      {company?.settings?.[key] ? (
                        <FaCheckCircle className="text-success me-2" />
                      ) : (
                        <FaTimesCircle className="text-danger me-2" />
                      )}
                      {label}
                    </div>
                  </Col>
                ))}

                <Col md={6} lg={4}>
                  <div className="mb-3">
                    <strong>Default Job Duration:</strong>{" "}
                    {company.settings?.defaultJobDurationMinutes} mins
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default CompanyDetailsScreen;