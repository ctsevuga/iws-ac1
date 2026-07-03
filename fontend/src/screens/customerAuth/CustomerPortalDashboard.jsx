import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useLogoutCustomerMutation,
  customerLogout,
} from "../../slices/customerAuthApiSlice";

const CustomerPortalDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { slug } = useParams();
const [logoutCustomer, { isLoading }] = useLogoutCustomerMutation();

const handleLogout = async () => {
  try {
    await logoutCustomer().unwrap();
    navigate(`/${slug}`, { replace: true });
  } catch (err) {
    console.error("Logout failed:", err);
  }
};
  return (
    <Container fluid className="py-4">
      <Row className="mb-4 align-items-center">
  <Col>
    <h2>Customer Portal</h2>
    <p className="text-muted">
      Welcome to the customer service portal.
    </p>
  </Col>

  <Col xs="auto">
    <Button
      variant="outline-danger"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  </Col>
</Row>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <Card.Title>Create Service Request</Card.Title>

              <Card.Text>
                Submit a new service request to the support team.
              </Card.Text>

              <Button
                variant="primary"
                onClick={() =>
                  navigate(`/${slug}/service-requests/create`)
                }
              >
                Create Request
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <Card.Title>My Service Requests</Card.Title>

              <Card.Text>
                View and track all your submitted service requests.
              </Card.Text>

              <Button
                variant="outline-primary"
                onClick={() =>
                  navigate(`/${slug}/service-requests`)
                }
              >
                View Requests
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerPortalDashboard;