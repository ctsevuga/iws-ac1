import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import { useSelector } from "react-redux";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useCloseServiceRequestMutation,
  useConvertServiceRequestMutation,
  useGetServiceRequestDetailsQuery,
} from "../../slices/serviceRequestApiSlice";

const ServiceRequestDetailsScreen = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  /**
   * =========================================================
   * AUTH
   * =========================================================
   */

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const isCustomer =
    userInfo?.role === "customer";

  /**
   * =========================================================
   * PERMISSIONS
   * =========================================================
   */

  const canEdit =
    userInfo?.role === "manager" ||
    userInfo?.role === "dispatcher";

  const canDelete =
    userInfo?.role === "manager";

  const canConvert =
    userInfo?.role === "manager" ||
    userInfo?.role === "dispatcher";

  const canClose =
    userInfo?.role === "manager" ||
    userInfo?.role === "dispatcher";

  /**
   * =========================================================
   * FETCH REQUEST
   * =========================================================
   */

  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useGetServiceRequestDetailsQuery(
    id
  );

  /**
   * =========================================================
   * MUTATIONS
   * =========================================================
   */

  const [
    convertServiceRequest,
    {
      isLoading: convertingRequest,
    },
  ] = useConvertServiceRequestMutation();

  const [
    closeServiceRequest,
    {
      isLoading: closingRequest,
    },
  ] = useCloseServiceRequestMutation();

  /**
   * =========================================================
   * BADGE HELPERS
   * =========================================================
   */

  const getPriorityVariant = (
    priority
  ) => {
    switch (priority) {
      case "urgent":
        return "danger";

      case "high":
        return "warning";

      case "medium":
        return "primary";

      case "low":
        return "secondary";

      default:
        return "secondary";
    }
  };

  const getStatusVariant = (
    status
  ) => {
    switch (status) {
      case "new":
        return "info";

      case "acknowledged":
        return "primary";

      case "assigned":
        return "primary";

      case "scheduled":
        return "warning";

      case "in_progress":
        return "warning";

      case "completed":
        return "success";

      case "cancelled":
        return "danger";

      case "closed":
        return "dark";

      default:
        return "secondary";
    }
  };

  /**
   * =========================================================
   * CONVERT HANDLER
   * =========================================================
   */

  const handleConvert = async () => {
    try {
      await convertServiceRequest(
        request._id
      ).unwrap();

      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * =========================================================
   * CLOSE HANDLER
   * =========================================================
   */

  const handleClose = async () => {
    try {
      await closeServiceRequest(
        request._id
      ).unwrap();

      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /**
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {
    return (
      <Alert variant="danger">
        {error?.data?.message ||
          "Failed to load service request"}
      </Alert>
    );
  }

  /**
   * =========================================================
   * NOT FOUND
   * =========================================================
   */

  if (!request) {
    return (
      <Alert variant="warning">
        Service request not found
      </Alert>
    );
  }

  return (
    <>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <Button
            variant="light"
            className="mb-3"
            onClick={() =>
              navigate(-1)
            }
          >
            ← Back
          </Button>

          <h3 className="mb-1">
            Service Request Details
          </h3>

          <small className="text-muted">
            Request ID: {request._id}
          </small>
        </div>

        {/* ACTIONS */}
        {!isCustomer && (
          <div className="d-flex gap-2 flex-wrap">
            {canEdit && (
              <Button
                variant="warning"
                onClick={() =>
                  navigate(
                    `/service-requests/${request._id}/edit`
                  )
                }
              >
                Edit
              </Button>
            )}

            {canConvert &&
              request.status !==
                "assigned" &&
              request.status !==
                "closed" &&
              request.status !==
                "cancelled" && (
                <Button
                  variant="success"
                  disabled={
                    convertingRequest
                  }
                  onClick={
                    handleConvert
                  }
                >
                  {convertingRequest
                    ? "Converting..."
                    : "Convert"}
                </Button>
              )}

            {canClose &&
              request.status !==
                "closed" && (
                <Button
                  variant="dark"
                  disabled={
                    closingRequest
                  }
                  onClick={
                    handleClose
                  }
                >
                  {closingRequest
                    ? "Closing..."
                    : "Close"}
                </Button>
              )}

            {canDelete && (
              <Button
                variant="danger"
                as={Link}
                to={`/service-requests/${request._id}/delete`}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <Row>
        {/* ===================================================== */}
        {/* MAIN CONTENT */}
        {/* ===================================================== */}

        <Col lg={8}>
          {/* REQUEST INFORMATION */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-4">
                Request Information
              </h5>

              <Table
                bordered
                responsive
              >
                <tbody>
                  <tr>
                    <th width="30%">
                      Ticket Number
                    </th>

                    <td>
                      {request.ticketNumber ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Issue Type
                    </th>

                    <td>
                      {
                        request.issueType
                      }
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Description
                    </th>

                    <td>
                      {request.description ||
                        "No description provided"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Priority
                    </th>

                    <td>
                      <Badge
                        bg={getPriorityVariant(
                          request.priority
                        )}
                      >
                        {request.priority?.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>

                  <tr>
                    <th>Status</th>

                    <td>
                      <Badge
                        bg={getStatusVariant(
                          request.status
                        )}
                      >
                        {
                          request.status
                        }
                      </Badge>
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Assignment
                    </th>

                    <td>
                      <Badge
                        bg={
                          request.assignmentStatus ===
                          "assigned"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {
                          request.assignmentStatus
                        }
                      </Badge>
                    </td>
                  </tr>

                  <tr>
                    <th>Source</th>

                    <td>
                      {
                        request.source
                      }
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Customer Visibility
                    </th>

                    <td>
                      <Badge
                        bg={
                          request.customerVisible
                            ? "success"
                            : "secondary"
                        }
                      >
                        {request.customerVisible
                          ? "Visible"
                          : "Hidden"}
                      </Badge>
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Preferred Date
                    </th>

                    <td>
                      {request.preferredDate
                        ? new Date(
                            request.preferredDate
                          ).toLocaleString()
                        : "Not specified"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Preferred Time Slot
                    </th>

                    <td>
                      {request.preferredTimeSlot ||
                        "Not specified"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Created By
                    </th>

                    <td>
                      {request.createdByType ===
                      "customer"
                        ? "Customer"
                        : "Staff"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Customer Approval
                    </th>

                    <td>
                      <Badge
                        bg={
                          request.customerApprovalStatus ===
                          "approved"
                            ? "success"
                            : request.customerApprovalStatus ===
                              "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {
                          request.customerApprovalStatus
                        }
                      </Badge>
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Customer Rating
                    </th>

                    <td>
                      {request.customerRating
                        ? `${request.customerRating}/5`
                        : "Not rated"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Created At
                    </th>

                    <td>
                      {new Date(
                        request.createdAt
                      ).toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Updated At
                    </th>

                    <td>
                      {new Date(
                        request.updatedAt
                      ).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* REQUIRED SKILLS */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-4">
                Required Skills
              </h5>

              {request.requiredSkills
                ?.length > 0 ? (
                <div className="d-flex gap-2 flex-wrap">
                  {request.requiredSkills.map(
                    (skill) => (
                      <Badge
                        key={skill}
                        bg="info"
                      >
                        {skill}
                      </Badge>
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No required skills
                  specified
                </p>
              )}
            </Card.Body>
          </Card>

          {/* CUSTOMER FEEDBACK */}
          {(request.customerFeedback ||
            request.internalNotes) && (
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body>
                <h5 className="mb-4">
                  Notes & Feedback
                </h5>

                {request.customerFeedback && (
                  <div className="mb-4">
                    <h6>
                      Customer Feedback
                    </h6>

                    <p className="mb-0">
                      {
                        request.customerFeedback
                      }
                    </p>
                  </div>
                )}

                {!isCustomer &&
                  request.internalNotes && (
                    <div>
                      <h6>
                        Internal Notes
                      </h6>

                      <p className="mb-0">
                        {
                          request.internalNotes
                        }
                      </p>
                    </div>
                  )}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* ===================================================== */}
        {/* SIDEBAR */}
        {/* ===================================================== */}

        <Col lg={4}>
          {/* CUSTOMER INFO */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-4">
                Customer Information
              </h5>

              <Table
                bordered
                responsive
              >
                <tbody>
                  <tr>
                    <th>Name</th>

                    <td>
                      {request.customer
                        ?.name ||
                        request
                          .customerSnapshot
                          ?.name ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>Phone</th>

                    <td>
                      {request.customer
                        ?.phone ||
                        request
                          .customerSnapshot
                          ?.phone ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>Email</th>

                    <td>
                      {request.customer
                        ?.email ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>Address</th>

                    <td>
                      {request
                        .serviceAddress
                        ?.street ||
                        request.customer
                          ?.address
                          ?.street ||
                        request
                          .customerSnapshot
                          ?.address ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>Area</th>

                    <td>
                      {request.area
                        ?.name ||
                        "-"}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* TECHNICIAN */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-4">
                Assigned Technician
              </h5>

              {request.assignedTechnician ? (
                <Table
                  bordered
                  responsive
                >
                  <tbody>
                    <tr>
                      <th>Name</th>

                      <td>
                        {
                          request
                            .assignedTechnician
                            .name
                        }
                      </td>
                    </tr>

                    <tr>
                      <th>Phone</th>

                      <td>
                        {
                          request
                            .assignedTechnician
                            .phone
                        }
                      </td>
                    </tr>

                    <tr>
                      <th>Email</th>

                      <td>
                        {
                          request
                            .assignedTechnician
                            .email
                        }
                      </td>
                    </tr>

                    <tr>
                      <th>Status</th>

                      <td>
                        <Badge bg="success">
                          Assigned
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <Alert variant="warning">
                  No technician assigned
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* CUSTOMER ATTACHMENTS */}
          {request.attachments
            ?.length > 0 && (
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body>
                <h5 className="mb-4">
                  Attachments
                </h5>

                <div className="d-flex flex-column gap-2">
                  {request.attachments.map(
                    (
                      attachment,
                      index
                    ) => (
                      <a
                        key={index}
                        href={
                          attachment.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none"
                      >
                        📎{" "}
                        {attachment.fileName ||
                          `Attachment ${
                            index + 1
                          }`}
                      </a>
                    )
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
};

export default ServiceRequestDetailsScreen;