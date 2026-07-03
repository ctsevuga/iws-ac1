import { Link, useParams } from "react-router-dom";

import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  Spinner,
  Alert,
  ListGroup,
} from "react-bootstrap";

import {
  useGetNotificationDetailsQuery,
  
} from "../../slices/notificationApiSlice";

import { useSelector } from "react-redux";

const NotificationDetailsScreen = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  /**
   * Get notification details
   */
  const {
    data: notification,
    isLoading,
    error,
    refetch,
  } = useGetNotificationDetailsQuery(id);

  

  /**
   * Status badge helper
   */
  const getStatusVariant = (status) => {
    switch (status) {
      case "pending":
        return "warning";

      case "sent":
        return "info";

      case "read":
        return "success";

      case "failed":
        return "danger";

      default:
        return "secondary";
    }
  };

  /**
   * Mark notification as read
   */
  

  return (
    <>
      <Row className="mb-3">
        <Col>
          <Button as={Link} to="/notifications" variant="light">
            ← Back
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">
          {error?.data?.message || error?.error || "Something went wrong"}
        </Alert>
      ) : (
        <Row>
          <Col md={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h4 className="mb-0">Notification Details</h4>
              </Card.Header>

              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Title:</strong> {notification.title}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>Message:</strong> {notification.message}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>Status:</strong>{" "}
                    <Badge bg={getStatusVariant(notification.status)}>
                      {notification.status}
                    </Badge>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>Channel:</strong> {notification.channel}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>Created:</strong>{" "}
                    {new Date(notification.createdAt).toLocaleString()}
                  </ListGroup.Item>

                  {notification.readAt && (
                    <ListGroup.Item>
                      <strong>Read At:</strong>{" "}
                      {new Date(notification.readAt).toLocaleString()}
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Service Request */}

            {notification.serviceRequest && (
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">Service Request</h5>
                </Card.Header>

                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Issue Type:</strong>{" "}
                      {notification.serviceRequest.issueType}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Description:</strong>{" "}
                      {notification.serviceRequest.description}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Priority:</strong>{" "}
                      {notification.serviceRequest.priority}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Preferred Date:</strong>{" "}
                      {notification.serviceRequest.preferredDate
                        ? new Date(
                            notification.serviceRequest.preferredDate,
                          ).toLocaleDateString()
                        : "N/A"}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Request Status:</strong>{" "}
                      {notification.serviceRequest.status}
                    </ListGroup.Item>
                  </ListGroup>

                  {/* Accept Request Button */}

                  {userInfo?.role === "technician" &&
                    notification.serviceRequest.status !== "accepted" && (
                      <div className="d-grid mt-4">
                        <Button
                          as={Link}
                          to={`/jobs/accept/${notification.serviceRequest._id}`}
                          variant="primary"
                        >
                          Accept Service Request
                        </Button>
                      </div>
                    )}
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}

          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Recipient</h5>
              </Card.Header>

              <Card.Body>
                <p>
                  <strong>Name:</strong> {notification?.recipient?.name}
                </p>

                <p>
                  <strong>Email:</strong> {notification?.recipient?.email}
                </p>

                <p>
                  <strong>Phone:</strong> {notification?.recipient?.phone}
                </p>

                
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default NotificationDetailsScreen;
