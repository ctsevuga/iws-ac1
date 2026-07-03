import React from "react";
import {
  Card,
  Row,
  Col,
  ListGroup,
  Image,
  Badge,
} from "react-bootstrap";

import { useGetCustomerProfileQuery } from "../../slices/customerAuthApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

const CustomerProfileScreen = () => {
  const {
    data: profile,
    isLoading,
    error,
  } = useGetCustomerProfileQuery();

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  }

  return (
    <Row className="justify-content-center">
      <Col md={10} lg={8}>
        {/* Company Card */}
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h4 className="mb-0">Company Information</h4>
          </Card.Header>

          <Card.Body>
            <Row className="align-items-center">
              <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
                {profile?.company?.logo ? (
                  <Image
                    src={profile.company.logo}
                    alt={profile.company.name}
                    fluid
                    rounded
                  />
                ) : (
                  <div
                    className="bg-light border rounded d-flex align-items-center justify-content-center"
                    style={{ height: "120px" }}
                  >
                    No Logo
                  </div>
                )}
              </Col>

              <Col md={9}>
                <h3>{profile?.company?.name}</h3>

                <p className="text-muted mb-0">
                  Company Portal
                </p>

                <small>
                  Slug: {profile?.company?.slug}
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Customer Profile */}
        <Card className="shadow-sm">
          <Card.Header>
            <h4 className="mb-0">My Profile</h4>
          </Card.Header>

          <ListGroup variant="flush">
            <ListGroup.Item>
              <Row>
                <Col md={4}>
                  <strong>Name</strong>
                </Col>
                <Col md={8}>{profile?.name}</Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col md={4}>
                  <strong>Phone</strong>
                </Col>
                <Col md={8}>{profile?.phone}</Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col md={4}>
                  <strong>Email</strong>
                </Col>
                <Col md={8}>
                  {profile?.email || "Not Provided"}
                </Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col md={4}>
                  <strong>Service Area</strong>
                </Col>
                <Col md={8}>
                  {profile?.area?.name || "Not Assigned"}
                </Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col md={4}>
                  <strong>Portal Access</strong>
                </Col>
                <Col md={8}>
                  {profile?.portalAccessEnabled ? (
                    <Badge bg="success">
                      Enabled
                    </Badge>
                  ) : (
                    <Badge bg="secondary">
                      Disabled
                    </Badge>
                  )}
                </Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col md={4}>
                  <strong>Last Login</strong>
                </Col>
                <Col md={8}>
                  {profile?.lastLoginAt
                    ? new Date(
                        profile.lastLoginAt
                      ).toLocaleString()
                    : "Never"}
                </Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col md={4}>
                  <strong>Member Since</strong>
                </Col>
                <Col md={8}>
                  {new Date(
                    profile.createdAt
                  ).toLocaleDateString()}
                </Col>
              </Row>
            </ListGroup.Item>
          </ListGroup>
        </Card>

        {/* Address */}
        <Card className="mt-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Address</h5>
          </Card.Header>

          <Card.Body>
            {profile?.address ? (
              <>
                <div>{profile.address.street}</div>

                <div>
                  {profile.address.city}
                  {profile.address.city &&
                  profile.address.state
                    ? ", "
                    : ""}
                  {profile.address.state}
                </div>

                <div>
                  {profile.address.pincode}
                </div>

                <div>
                  {profile.address.country}
                </div>
              </>
            ) : (
              <p className="mb-0 text-muted">
                No address available.
              </p>
            )}
          </Card.Body>
        </Card>

        {/* Notes */}
        {profile?.notes && (
          <Card className="mt-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                Customer Notes
              </h5>
            </Card.Header>

            <Card.Body>
              <p className="mb-0">
                {profile.notes}
              </p>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default CustomerProfileScreen;