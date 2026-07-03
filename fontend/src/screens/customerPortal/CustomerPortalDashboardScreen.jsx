import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CustomerPortalDashboardScreen = () => {
  const navigate = useNavigate();

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  useEffect(() => {
    if (
      !userInfo ||
      !["manager", "dispatcher"].includes(
        userInfo.role
      )
    ) {
      toast.error(
        "Not authorized to access Customer Portal"
      );

      navigate("/");
    }
  }, [navigate, userInfo]);

  const isManager =
    userInfo?.role === "manager";

  const isDispatcher =
    userInfo?.role === "dispatcher";

  return (
    <Row className="justify-content-center">
      <Col lg={10}>
        <h2 className="mb-4">
          Customer Portal Dashboard
        </h2>

        <Row>
          {/* VIEW */}

          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>
                  View Portal Settings
                </Card.Title>

                <Card.Text>
                  View current customer
                  portal configuration,
                  services, announcements,
                  branding and contact
                  information.
                </Card.Text>

                <Button
                  as={Link}
                  to="/customer-portal/view"
                  variant="primary"
                >
                  View Settings
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* CREATE */}

          {isManager && (
            <Col
              md={4}
              className="mb-4"
            >
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    Create Portal
                    Settings
                  </Card.Title>

                  <Card.Text>
                    Configure the
                    customer portal for
                    the first time,
                    including branding,
                    services and portal
                    content.
                  </Card.Text>

                  <Button
                    as={Link}
                    to="/customer-portal/create"
                    variant="success"
                  >
                    Create Settings
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* EDIT */}

          {isManager && (
            <Col
              md={4}
              className="mb-4"
            >
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    Edit Portal
                    Settings
                  </Card.Title>

                  <Card.Text>
                    Update branding,
                    contact details,
                    services,
                    announcements and
                    feature settings.
                  </Card.Text>

                  <Button
                    as={Link}
                    to="/customer-portal/edit"
                    variant="warning"
                  >
                    Edit Settings
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* ROLE INFO */}

        <Card className="mt-3">
          <Card.Body>
            <h5>
              Current Access Level
            </h5>

            {isManager && (
              <p className="mb-0 text-success">
                Manager: Full access to
                customer portal
                settings.
              </p>
            )}

            {isDispatcher && (
              <p className="mb-0 text-primary">
                Dispatcher: Read-only
                access to customer
                portal settings.
              </p>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CustomerPortalDashboardScreen;