import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Spinner,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import {
  useGetServiceRequestDetailsQuery,
  useCloseServiceRequestMutation,
} from "../../slices/serviceRequestApiSlice";

const CloseServiceRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * Auth
   * Manager acts as system admin
   */
  const { userInfo } = useSelector((state) => state.auth);

  const canClose =
    userInfo?.role === "manager" ||
    userInfo?.role === "dispatcher";

  /**
   * Fetch request details
   */
  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useGetServiceRequestDetailsQuery(id);

  /**
   * Close mutation
   */
  const [
    closeServiceRequest,
    { isLoading: closing },
  ] = useCloseServiceRequestMutation();

  /**
   * Helpers
   */
  const getStatusVariant = (status) => {
    switch (status) {
      case "new":
        return "info";
      case "assigned":
        return "primary";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "closed":
        return "dark";
      default:
        return "secondary";
    }
  };

  const getPriorityLabel = (priority) =>
    priority ? priority.toUpperCase() : "-";

  /**
   * Guard
   */
  if (!canClose) {
    return (
      <Alert variant="danger">
        Access denied. Only Manager or Dispatcher can close service requests.
      </Alert>
    );
  }

  /**
   * Loading
   */
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /**
   * Error
   */
  if (error) {
    return (
      <Alert variant="danger">
        {error?.data?.message || "Failed to load service request"}
      </Alert>
    );
  }

  if (!request) {
    return (
      <Alert variant="warning">
        Service request not found
      </Alert>
    );
  }

  const isClosed = request.status === "closed";

  /**
   * Close Handler
   */
  const closeHandler = async () => {
    if (isClosed) {
      toast.info("Service request is already closed");
      return;
    }

    if (!window.confirm("Are you sure you want to close this service request?")) {
      return;
    }

    try {
      await closeServiceRequest(id).unwrap();

      toast.success("Service request closed successfully");

      refetch();

      navigate("/service-requests");
    } catch (err) {
      toast.error(
        err?.data?.message || "Failed to close service request"
      );
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Close Service Request</h4>

          <Badge bg={getStatusVariant(request.status)}>
            {request.status}
          </Badge>
        </div>

        {/* Details */}
        <Row className="mb-4">
          <Col md={6}>
            <p className="mb-1">
              <strong>Customer:</strong>{" "}
              {request.customer?.name ||
                request.customerSnapshot?.name ||
                "-"}
            </p>

            <p className="mb-1">
              <strong>Phone:</strong>{" "}
              {request.customer?.phone ||
                request.customerSnapshot?.phone ||
                "-"}
            </p>

            <p className="mb-1">
              <strong>Issue:</strong> {request.issueType}
            </p>

            <p className="mb-1">
              <strong>Source:</strong> {request.source || "-"}
            </p>
          </Col>

          <Col md={6}>
            <p className="mb-1">
              <strong>Priority:</strong>{" "}
              {getPriorityLabel(request.priority)}
            </p>

            <p className="mb-1">
              <strong>Area:</strong>{" "}
              {request.area?.name || "-"}
            </p>

            <p className="mb-1">
              <strong>Preferred Date:</strong>{" "}
              {request.preferredDate
                ? new Date(request.preferredDate).toLocaleString()
                : "-"}
            </p>

            <p className="mb-1">
              <strong>Created:</strong>{" "}
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </Col>
        </Row>

        {/* Description */}
        {request.description && (
          <div className="mb-4">
            <strong>Description:</strong>
            <p className="mt-2 text-muted">
              {request.description}
            </p>
          </div>
        )}

        {/* Warning */}
        <Alert variant="warning" className="mb-4">
          Closing this request will mark it as <b>completed workflow ended</b>.
        </Alert>

        {/* Action */}
        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          <Button
            variant="danger"
            disabled={closing || isClosed}
            onClick={closeHandler}
          >
            {closing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Closing...
              </>
            ) : isClosed ? (
              "Already Closed"
            ) : (
              "Close Request"
            )}
          </Button>
        </div>

      </Card.Body>
    </Card>
  );
};

export default CloseServiceRequest;