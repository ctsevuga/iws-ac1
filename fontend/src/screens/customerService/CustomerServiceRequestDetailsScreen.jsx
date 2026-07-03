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
  FaClipboardList,
  FaArrowLeft,
  FaCalendarAlt,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";

import { useParams, useNavigate } from "react-router-dom";

import { useGetMyServiceRequestDetailsQuery } from "../../slices/customerServiceApiSlice";

const CustomerServiceRequestDetailsScreen = () => {
  // ✅ FIX: get BOTH params from URL
  const { companySlug, id } = useParams();

  const navigate = useNavigate();

  // =====================================================
  // API CALL (now tenant-aware if needed later)
  // =====================================================
  const {
    data: request,
    isLoading,
    error,
  } = useGetMyServiceRequestDetailsQuery({
    companySlug,
    requestId: id,
  });

  // =====================================================
  // STATUS BADGE
  // =====================================================
  const getStatusVariant = (status) => {
    switch (status) {
      case "open":
        return "primary";
      case "assigned":
        return "warning";
      case "converted":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  // =====================================================
  // PRIORITY BADGE
  // =====================================================
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "secondary";
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
            <FaClipboardList className="me-2" />
            Service Request Details
          </h3>
        </Col>

        <Col className="text-end">
          <Button
            variant="outline-secondary"
            onClick={() => navigate(`/${companySlug}/service-requests`)}
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center text-danger py-4">
            {error?.data?.message || "Failed to load service request"}
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* MAIN DETAILS */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h4 className="fw-bold mb-3">{request?.issueType}</h4>

                  <div className="mb-3">
                    <Badge
                      bg={getStatusVariant(request?.status)}
                      className="me-2"
                    >
                      {request?.status}
                    </Badge>

                    <Badge bg={getPriorityVariant(request?.priority)}>
                      {request?.priority}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <strong>Description</strong>
                    <div className="mt-2 text-muted">
                      {request?.description || "No description provided"}
                    </div>
                  </div>
                </Col>

                <Col md={4}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FaMapMarkerAlt className="me-2 text-danger" />
                      Area: {request?.area?.name || "-"}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <FaCalendarAlt className="me-2 text-success" />
                      Preferred Date:{" "}
                      {request?.preferredDate
                        ? new Date(request.preferredDate).toLocaleDateString()
                        : "Not specified"}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <FaClock className="me-2 text-warning" />
                      Created:{" "}
                      {request?.createdAt
                        ? new Date(request.createdAt).toLocaleString()
                        : "-"}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* CUSTOMER INFO */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <h5 className="fw-bold text-primary mb-3">
                    <FaUser className="me-2" />
                    Customer Information
                  </h5>

                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Name:</strong> {request?.customer?.name}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <FaPhone className="me-2 text-success" />
                      {request?.customer?.phone}
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <h5 className="fw-bold text-primary mb-3">
                    <FaInfoCircle className="me-2" />
                    Request Information
                  </h5>

                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Request ID:</strong>
                      <br />
                      <small className="text-muted">{request?._id}</small>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Source:</strong> {request?.source || "-"}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      Priority: {request?.priority}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      Status:{" "}
                      <Badge bg={getStatusVariant(request?.status)}>
                        {request?.status}
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* SNAPSHOT */}
          {request?.customerSnapshot && (
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="fw-bold text-primary mb-3">Customer Snapshot</h5>

                <Row>
                  <Col md={4}>
                    <strong>Name</strong>
                    <div>{request.customerSnapshot.name}</div>
                  </Col>

                  <Col md={4}>
                    <strong>Phone</strong>
                    <div>{request.customerSnapshot.phone}</div>
                  </Col>

                  <Col md={4}>
                    <strong>Address</strong>

                    <div>
                      {[
                        request.customerSnapshot.address?.street,
                        request.customerSnapshot.address?.city,
                        request.customerSnapshot.address?.state,
                        request.customerSnapshot.address?.pincode,
                        request.customerSnapshot.address?.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default CustomerServiceRequestDetailsScreen;
