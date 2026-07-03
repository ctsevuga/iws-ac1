import React from "react";
import {
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Badge,
  ListGroup,
  Button,
} from "react-bootstrap";

import { Link } from "react-router-dom";

import { useGetMyCompanyQuery } from "../../slices/companyApiSlice";

const CompanyProfileScreen = () => {
  const {
    data: company,
    isLoading,
    error,
  } = useGetMyCompanyQuery();

  const logo =
    company?.branding?.logoUrl ||
    company?.logoUrl ||
    "";

  const plan = company?.plan || "free";
  const status = company?.subscriptionStatus || "trial";

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        {error?.data?.message ||
          error?.error ||
          "Failed to load company"}
      </Alert>
    );
  }

  return (
    <Row className="justify-content-center my-4">
      <Col md={10} lg={8}>
        <Card className="shadow-sm border-0">
          <Card.Body>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="d-flex align-items-center">

                {logo ? (
                  <img
                    src={logo}
                    alt={company?.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginRight: "20px",
                    }}
                  />
                ) : (
                  <div
                    className="bg-secondary text-white d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "10px",
                      fontSize: "28px",
                      fontWeight: "bold",
                      marginRight: "20px",
                    }}
                  >
                    {company?.name?.charAt(0)}
                  </div>
                )}

                <div>
                  <h2 className="mb-1">{company?.name}</h2>

                  {company?.legalName && (
                    <p className="text-muted mb-2">
                      Legal Name: {company.legalName}
                    </p>
                  )}

                  <Badge
                    bg={
                      status === "active"
                        ? "success"
                        : status === "trial"
                        ? "warning"
                        : "danger"
                    }
                    className="me-2"
                  >
                    {status}
                  </Badge>

                  <Badge bg="dark">{plan}</Badge>
                </div>
              </div>

              {/* Edit Button */}
              <Link to={`/companies/${company?._id}/edit`}>
                <Button variant="primary">
                  Edit Company
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <Card className="mb-3">
              <Card.Header>Contact Information</Card.Header>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Email:</strong> {company?.email}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Phone:</strong> {company?.phone}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Website:</strong>{" "}
                  {company?.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {company.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card>

            {/* Address */}
            <Card className="mb-3">
              <Card.Header>Address</Card.Header>

              <Card.Body>
                <p className="mb-1">
                  {company?.address?.street || "-"}
                </p>

                <p className="mb-1">
                  {company?.address?.city}
                  {company?.address?.state
                    ? `, ${company.address.state}`
                    : ""}
                </p>

                <p className="mb-1">
                  {company?.address?.pincode || "-"}
                </p>

                <p className="mb-0">
                  {company?.address?.country || "-"}
                </p>
              </Card.Body>
            </Card>

            {/* Business Settings */}
            <Card className="mb-3">
              <Card.Header>Business Settings</Card.Header>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Timezone:</strong>{" "}
                  {company?.timezone || "Asia/Kolkata"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Currency:</strong>{" "}
                  {company?.currency || "INR"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Online Booking:</strong>{" "}
                  {company?.settings?.allowOnlineBooking ? (
                    <Badge bg="success">Enabled</Badge>
                  ) : (
                    <Badge bg="secondary">Disabled</Badge>
                  )}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Auto Assign Technician:</strong>{" "}
                  {company?.settings?.autoAssignTechnician ? (
                    <Badge bg="success">Enabled</Badge>
                  ) : (
                    <Badge bg="secondary">Disabled</Badge>
                  )}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Default Job Duration:</strong>{" "}
                  {company?.settings?.defaultJobDurationMinutes || 60} mins
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Invoicing:</strong>{" "}
                  {company?.settings?.enableInvoicing ? (
                    <Badge bg="success">Enabled</Badge>
                  ) : (
                    <Badge bg="secondary">Disabled</Badge>
                  )}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Payments:</strong>{" "}
                  {company?.settings?.enablePayments ? (
                    <Badge bg="success">Enabled</Badge>
                  ) : (
                    <Badge bg="secondary">Disabled</Badge>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card>

            {/* Metadata */}
            <Card>
              <Card.Header>Account Details</Card.Header>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Active:</strong>{" "}
                  {company?.isActive ? (
                    <Badge bg="success">Yes</Badge>
                  ) : (
                    <Badge bg="danger">No</Badge>
                  )}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Created At:</strong>{" "}
                  {company?.createdAt
                    ? new Date(company.createdAt).toLocaleString()
                    : "-"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Updated At:</strong>{" "}
                  {company?.updatedAt
                    ? new Date(company.updatedAt).toLocaleString()
                    : "-"}
                </ListGroup.Item>

                {company?.trialEndsAt && (
                  <ListGroup.Item>
                    <strong>Trial Ends:</strong>{" "}
                    {new Date(company.trialEndsAt).toLocaleDateString()}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>

          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CompanyProfileScreen;