import React from "react";

import {
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  ListGroup,
  Button,
} from "react-bootstrap";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useGetCustomerDetailsQuery } from "../../slices/customerApiSlice";

const CustomerDetailsScreen = () => {
  const navigate = useNavigate();
  const { id: customerId } = useParams();

  const {
    data: customer,
    isLoading,
    error,
  } = useGetCustomerDetailsQuery(customerId);

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
          "Failed to load customer"}
      </Alert>
    );
  }

  const address = customer?.address || {};

  return (
    <Row className="justify-content-center my-4">
      <Col md={10} lg={8}>
        <Card className="shadow-sm border-0">
          <Card.Body>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="d-flex align-items-center">

                <div
                  className="bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "10px",
                    fontSize: "28px",
                    fontWeight: "bold",
                    marginRight: "20px",
                  }}
                >
                  {customer?.name?.charAt(0)}
                </div>

                <div>
                  <h2 className="mb-1">
                    {customer?.name}
                  </h2>

                  <p className="text-muted mb-2">
                    Customer Profile
                  </p>

                  {customer?.isActive ? (
                    <Badge bg="success">
                      Active
                    </Badge>
                  ) : (
                    <Badge bg="secondary">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2">
                <Link
                  to={`/customers/${customer?._id}/edit`}
                >
                  <Button variant="warning">
                    Edit
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <Card className="mb-3">
              <Card.Header>
                Contact Information
              </Card.Header>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Name:</strong>{" "}
                  {customer?.name}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Phone:</strong>{" "}
                  {customer?.phone}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Email:</strong>{" "}
                  {customer?.email || "N/A"}
                </ListGroup.Item>
              </ListGroup>
            </Card>

            {/* Address */}
            <Card className="mb-3">
              <Card.Header>Address</Card.Header>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Street:</strong>{" "}
                  {address.street || "N/A"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>City:</strong>{" "}
                  {address.city || "N/A"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>State:</strong>{" "}
                  {address.state || "N/A"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Pincode:</strong>{" "}
                  {address.pincode || "N/A"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Country:</strong>{" "}
                  {address.country || "USA"}
                </ListGroup.Item>
              </ListGroup>
            </Card>

            {/* Area */}
            <Card className="mb-3">
              <Card.Header>
                Area Information
              </Card.Header>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Area:</strong>{" "}
                  {customer?.area?.name || "N/A"}
                </ListGroup.Item>

                {customer?.area?.description && (
                  <ListGroup.Item>
                    <strong>Description:</strong>{" "}
                    {customer.area.description}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>

            {/* Notes */}
            <Card className="mb-3">
              <Card.Header>Notes</Card.Header>

              <Card.Body>
                {customer?.notes ? (
                  <p className="mb-0">
                    {customer.notes}
                  </p>
                ) : (
                  <p className="text-muted mb-0">
                    No notes available
                  </p>
                )}
              </Card.Body>
            </Card>

            {/* Metadata */}
            <Card>
              <Card.Header>
                Account Details
              </Card.Header>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>ID:</strong>{" "}
                  {customer?._id}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Created:</strong>{" "}
                  {new Date(
                    customer?.createdAt
                  ).toLocaleString()}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Updated:</strong>{" "}
                  {new Date(
                    customer?.updatedAt
                  ).toLocaleString()}
                </ListGroup.Item>
              </ListGroup>
            </Card>

          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CustomerDetailsScreen;