import { useMemo, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import { useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import {
  useGetServiceRequestsQuery,
  useDeleteServiceRequestMutation,
  useCloseServiceRequestMutation,
} from "../../slices/serviceRequestApiSlice";

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const ServiceRequestList = () => {

  const navigate = useNavigate();

  /**
   * =======================================================
   * AUTH
   * =======================================================
   */

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  /**
   * =======================================================
   * PERMISSIONS
   * =======================================================
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

  const isTechnician =
    userInfo?.role === "technician";

  /**
   * =======================================================
   * FILTERS
   * =======================================================
   */

  const [filters, setFilters] =
    useState({
      status: "",

      priority: "",

      issueType: "",

      search: "",

      page: 1,

      limit: 10,
    });

  /**
   * =======================================================
   * FETCH SERVICE REQUESTS
   * =======================================================
   */

  const {
    data,

    isLoading,

    error,

    refetch,
  } =
    useGetServiceRequestsQuery({
      page: filters.page,

      limit: filters.limit,

      status:
        filters.status ||
        undefined,

      priority:
        filters.priority ||
        undefined,

      issueType:
        filters.issueType ||
        undefined,

      search:
        filters.search ||
        undefined,
    });

  /**
   * =======================================================
   * DELETE MUTATION
   * =======================================================
   */

  const [
    deleteServiceRequest,
    {
      isLoading:
        deletingRequest,
    },
  ] =
    useDeleteServiceRequestMutation();

  /**
   * =======================================================
   * CLOSE MUTATION
   * =======================================================
   */

  const [
    closeServiceRequest,
    {
      isLoading:
        closingRequest,
    },
  ] =
    useCloseServiceRequestMutation();

  /**
   * =======================================================
   * EXTRACT DATA
   * =======================================================
   */

  const serviceRequests =
    useMemo(
      () =>
        data?.serviceRequests ||
        [],
      [data]
    );

  const totalPages =
    data?.pages || 1;

  /**
   * =======================================================
   * HANDLE FILTER CHANGE
   * =======================================================
   */

  const handleFilterChange = (
    e
  ) => {

    const { name, value } =
      e.target;

    setFilters((prev) => ({
      ...prev,

      [name]: value,

      page: 1,
    }));
  };

  /**
   * =======================================================
   * DELETE HANDLER
   * =======================================================
   */

  const deleteHandler = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this service request?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteServiceRequest(
        id
      ).unwrap();

      toast.success(
        "Service request deleted successfully"
      );

      refetch();

    } catch (err) {

      toast.error(
        err?.data?.message ||
          "Failed to delete service request"
      );
    }
  };

  /**
   * =======================================================
   * CLOSE HANDLER
   * =======================================================
   */

  const closeHandler = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to close this request?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await closeServiceRequest(
        id
      ).unwrap();

      toast.success(
        "Service request closed successfully"
      );

      refetch();

    } catch (err) {

      toast.error(
        err?.data?.message ||
          "Failed to close service request"
      );
    }
  };

  /**
   * =======================================================
   * PRIORITY BADGE
   * =======================================================
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

  /**
   * =======================================================
   * STATUS BADGE
   * =======================================================
   */

  const getStatusVariant = (
    status
  ) => {

    switch (status) {

      case "new":
        return "info";

      case "acknowledged":
        return "secondary";

      case "assigned":
        return "primary";

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
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (isLoading) {

    return (
      <div className="text-center py-5">

        <Spinner animation="border" />

      </div>
    );
  }

  /**
   * =======================================================
   * ERROR
   * =======================================================
   */

  if (error) {

    return (
      <Alert variant="danger">

        {error?.data?.message ||
          "Failed to load service requests"}

      </Alert>
    );
  }

  /**
   * =======================================================
   * UI
   * =======================================================
   */

  return (
    <Card className="shadow-sm border-0">

      <Card.Body>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h4 className="mb-1">
              Service Requests
            </h4>

            <small className="text-muted">
              Manage and track
              customer service
              requests
            </small>

          </div>

          {canEdit && (
            <Button
              variant="primary"
              onClick={() =>
                navigate(
                  "/service-requests/create"
                )
              }
            >
              Create Request
            </Button>
          )}

        </div>

        {/* Filters */}
        <Row className="mb-4 g-3">

          {/* Search */}
          <Col md={3}>

            <Form.Group>

              <Form.Label>
                Search
              </Form.Label>

              <InputGroup>

                <Form.Control
                  type="text"
                  placeholder="Search..."
                  name="search"
                  value={
                    filters.search
                  }
                  onChange={
                    handleFilterChange
                  }
                />

              </InputGroup>

            </Form.Group>

          </Col>

          {/* Status */}
          <Col md={3}>

            <Form.Group>

              <Form.Label>
                Status
              </Form.Label>

              <Form.Select
                name="status"
                value={
                  filters.status
                }
                onChange={
                  handleFilterChange
                }
              >
                <option value="">
                  All
                </option>

                <option value="new">
                  New
                </option>

                <option value="acknowledged">
                  Acknowledged
                </option>

                <option value="assigned">
                  Assigned
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

                <option value="closed">
                  Closed
                </option>

              </Form.Select>

            </Form.Group>

          </Col>

          {/* Priority */}
          <Col md={3}>

            <Form.Group>

              <Form.Label>
                Priority
              </Form.Label>

              <Form.Select
                name="priority"
                value={
                  filters.priority
                }
                onChange={
                  handleFilterChange
                }
              >
                <option value="">
                  All
                </option>

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="urgent">
                  Urgent
                </option>

              </Form.Select>

            </Form.Group>

          </Col>

          {/* Issue Type */}
          <Col md={3}>

            <Form.Group>

              <Form.Label>
                Issue Type
              </Form.Label>

              <Form.Select
                name="issueType"
                value={
                  filters.issueType
                }
                onChange={
                  handleFilterChange
                }
              >
                <option value="">
                  All
                </option>

                <option value="AC Repair">
                  AC Repair
                </option>

                <option value="AC Installation">
                  AC Installation
                </option>

                <option value="Heating Issue">
                  Heating Issue
                </option>

                <option value="Maintenance">
                  Maintenance
                </option>

                <option value="Other">
                  Other
                </option>

              </Form.Select>

            </Form.Group>

          </Col>

        </Row>

        {/* Table */}
        <div className="table-responsive">

          <Table
            hover
            bordered
            className="align-middle"
          >

            <thead className="table-light">

              <tr>

                <th>#</th>

                <th>Request</th>

                <th>Customer</th>

                <th>Area</th>

                <th>Priority</th>

                <th>Status</th>

                <th>Technician</th>

                <th>Preferred Schedule</th>

                <th>Created</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {serviceRequests.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={10}
                    className="text-center py-4"
                  >
                    No service requests
                    found
                  </td>

                </tr>

              ) : (

                serviceRequests.map(
                  (
                    request,
                    index
                  ) => (

                    <tr
                      key={
                        request._id
                      }
                    >

                      {/* Serial */}
                      <td>

                        {(filters.page -
                          1) *
                          filters.limit +
                          index +
                          1}

                      </td>

                      {/* Request */}
                      <td>

                        <div className="fw-semibold">

                          {request.title ||
                            request.issueType}

                        </div>

                        <small className="text-muted">

                          {
                            request.issueType
                          }

                        </small>

                      </td>

                      {/* Customer */}
                      <td>

                        <div className="fw-semibold">

                          {request
                            .customerSnapshot
                            ?.name ||
                            request
                              .customer
                              ?.name}

                        </div>

                        <small className="text-muted">

                          {request
                            .customerSnapshot
                            ?.phone ||
                            request
                              .customer
                              ?.phone}

                        </small>

                      </td>

                      {/* Area */}
                      <td>

                        {request.area
                          ?.name || "-"}

                      </td>

                      {/* Priority */}
                      <td>

                        <Badge
                          bg={getPriorityVariant(
                            request.priority
                          )}
                        >
                          {request.priority?.toUpperCase()}
                        </Badge>

                      </td>

                      {/* Status */}
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

                      {/* Technician */}
                      <td>

                        {request
                          .assignedTechnician
                          ?.name ? (

                          <>
                            <div className="fw-semibold">

                              {
                                request
                                  .assignedTechnician
                                  .name
                              }

                            </div>

                            <small className="text-muted">

                              {
                                request
                                  .assignedTechnician
                                  .phone
                              }

                            </small>
                          </>

                        ) : (

                          <span className="text-muted">
                            Unassigned
                          </span>

                        )}

                      </td>

                      {/* Preferred Schedule */}
                      <td>

                        {request.preferredDate ? (
                          <>

                            <div>

                              {new Date(
                                request.preferredDate
                              ).toLocaleDateString()}

                            </div>

                            <small className="text-muted">

                              {request.preferredTimeSlot ||
                                "anytime"}

                            </small>

                          </>
                        ) : (
                          "-"
                        )}

                      </td>

                      {/* Created */}
                      <td>

                        {new Date(
                          request.createdAt
                        ).toLocaleDateString()}

                      </td>

                      {/* Actions */}
                      <td>

                        <div className="d-flex gap-2 flex-wrap">

                          {/* View */}
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              navigate(
                                `/service-requests/${request._id}`
                              )
                            }
                          >
                            View
                          </Button>

                          {/* Edit */}
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() =>
                                navigate(
                                  `/service-requests/${request._id}/edit`
                                )
                              }
                            >
                              Edit
                            </Button>
                          )}

                          {/* Assign */}
                          {canEdit &&
                            !isTechnician && (
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() =>
                                  navigate(
                                    `/service-requests/${request._id}/assign`
                                  )
                                }
                              >
                                Assign
                              </Button>
                            )}

                          {/* Convert */}
                          {canConvert &&
                            request.status !==
                              "closed" && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() =>
                                  navigate(
                                    `/service-requests/${request._id}/convert`
                                  )
                                }
                              >
                                Convert
                              </Button>
                            )}

                          {/* Close */}
                          {canClose && (
                            <Button
                              size="sm"
                              variant="outline-dark"
                              disabled={
                                request.status ===
                                  "closed" ||
                                closingRequest
                              }
                              onClick={() =>
                                closeHandler(
                                  request._id
                                )
                              }
                            >
                              Close
                            </Button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={
                                deletingRequest
                              }
                              onClick={() =>
                                deleteHandler(
                                  request._id
                                )
                              }
                            >
                              Delete
                            </Button>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </Table>

        </div>

        {/* Pagination */}
        {totalPages > 1 && (

          <div className="d-flex justify-content-center mt-4">

            <Pagination>

              <Pagination.Prev
                disabled={
                  filters.page === 1
                }
                onClick={() =>
                  setFilters(
                    (prev) => ({
                      ...prev,

                      page:
                        prev.page -
                        1,
                    })
                  )
                }
              />

              {[...Array(totalPages).keys()].map(
                (x) => (

                  <Pagination.Item
                    key={x + 1}
                    active={
                      x + 1 ===
                      filters.page
                    }
                    onClick={() =>
                      setFilters(
                        (
                          prev
                        ) => ({
                          ...prev,

                          page:
                            x +
                            1,
                        })
                      )
                    }
                  >
                    {x + 1}
                  </Pagination.Item>

                )
              )}

              <Pagination.Next
                disabled={
                  filters.page ===
                  totalPages
                }
                onClick={() =>
                  setFilters(
                    (prev) => ({
                      ...prev,

                      page:
                        prev.page +
                        1,
                    })
                  )
                }
              />

            </Pagination>

          </div>

        )}

      </Card.Body>

    </Card>
  );
};

export default ServiceRequestList;