import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Table,
  Button,
  Badge,
  Row,
  Col,
  Card,
  Form,
  Pagination,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  useGetNotificationsQuery,
} from "../../slices/notificationApiSlice";

import { useSelector } from "react-redux";

import { useGetAreasQuery } from "../../slices/areaApiSlice";
import { useGetTechniciansQuery } from "../../slices/technicianApiSlice";

const NotificationsListScreen = () => {
  const { userInfo } = useSelector(
  (state) => state.auth
);
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("");
  const [area, setArea] = useState("");
  const [technician, setTechnician] =
    useState("");

  /**
   * Fetch areas
   */
  const { data: areasData } =
    useGetAreasQuery();

  /**
   * Fetch technicians
   */
  const { data: techniciansData } =
  useGetTechniciansQuery(
    {
      page: 1,
      limit: 100,
    },
    {
      skip: userInfo?.role === "technician",
    }
  );

  /**
   * Fetch notifications
   */
  const {
    data,
    isLoading,
    error,
  } = useGetNotificationsQuery({
    page,
    limit: 10,
    status,
    area,
    technician,
  });

  /**
   * Badge variant helper
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

  return (
    <>
      <Row className="align-items-center mb-4 g-2">
        <Col md={3}>
          <h2 className="mb-0">
            Notifications
          </h2>
        </Col>

        {/* Status Filter */}

        <Col md={3}>
          <Form.Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="sent">
              Sent
            </option>

            <option value="read">
              Read
            </option>

            <option value="failed">
              Failed
            </option>
          </Form.Select>
        </Col>

        {/* Area Filter */}

        <Col md={3}>
          <Form.Select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setPage(1);
            }}
          >
            <option value="">
              All Areas
            </option>

            {areasData?.results?.map(
              (a) => (
                <option
                  key={a._id}
                  value={a._id}
                >
                  {a.name}
                </option>
              )
            )}
          </Form.Select>
        </Col>

        {/* Technician Filter */}

        {userInfo?.role !== "technician" && (
  <Col md={3}>
    <Form.Select
      value={technician}
      onChange={(e) => {
        setTechnician(e.target.value);
        setPage(1);
      }}
    >
      <option value="">
        All Technicians
      </option>

      {techniciansData?.results?.map((tech) => (
        <option key={tech._id} value={tech._id}>
          {tech.name}
        </option>
      ))}
    </Form.Select>
  </Col>
)}
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">
          {error?.data?.message ||
            error?.error ||
            "Something went wrong"}
        </Alert>
      ) : (
        <>
          <Card className="shadow-sm">
            <Card.Body>
              <Table
                responsive
                hover
                striped
                className="align-middle"
              >
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Area</th>
                    <th>Technician</th>
                    <th>Issue Type</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {data?.results?.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-4"
                      >
                        No notifications found
                      </td>
                    </tr>
                  ) : (
                    data?.results?.map(
                      (notification) => (
                        <tr
                          key={
                            notification._id
                          }
                        >
                          <td>
                            {
                              notification.title
                            }
                          </td>

                          <td>
                            {
                              notification.message
                            }
                          </td>

                          <td>
                            {
                              notification
                                ?.area?.name
                            }
                          </td>

                          <td>
                            {
                              notification
                                ?.recipient
                                ?.name
                            }
                          </td>

                          <td>
                            {
                              notification
                                ?.serviceRequest
                                ?.issueType
                            }
                          </td>

                          <td>
                            <Badge
                              bg={getStatusVariant(
                                notification.status
                              )}
                            >
                              {
                                notification.status
                              }
                            </Badge>
                          </td>

                          <td>
                            {new Date(
                              notification.createdAt
                            ).toLocaleString()}
                          </td>

                          <td>
                            <Button
                              as={Link}
                              to={`/notifications/${notification._id}`}
                              variant="primary"
                              size="sm"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Pagination */}

          {data?.pages > 1 && (
            <Pagination className="mt-4 justify-content-center">
              {[...Array(data.pages).keys()].map(
                (x) => (
                  <Pagination.Item
                    key={x + 1}
                    active={
                      x + 1 === page
                    }
                    onClick={() =>
                      setPage(x + 1)
                    }
                  >
                    {x + 1}
                  </Pagination.Item>
                )
              )}
            </Pagination>
          )}
        </>
      )}
    </>
  );
};

export default NotificationsListScreen;