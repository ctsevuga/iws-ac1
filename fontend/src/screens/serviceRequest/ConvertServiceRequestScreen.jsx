import { useState } from "react";

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
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetServiceRequestDetailsQuery,
  useConvertServiceRequestMutation,
} from "../../slices/serviceRequestApiSlice";

const ConvertServiceRequestScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * Auth
   * Manager acts as admin (full control)
   */
  const { userInfo } = useSelector((state) => state.auth);

  const canConvert =
    userInfo?.role === "manager" ||
    userInfo?.role === "dispatcher";

  /**
   * Fetch request
   */
  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useGetServiceRequestDetailsQuery(id);

  /**
   * Mutation
   */
  const [
    convertServiceRequest,
    { isLoading: converting },
  ] = useConvertServiceRequestMutation();

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

  const getPriorityVariant = (priority) => {
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
   * Guard: Access Control
   */
  if (!canConvert) {
    return (
      <Alert variant="danger">
        Access denied. Only Manager or Dispatcher can convert service requests.
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

  /**
   * Convert handler
   */
  const handleConvert = async () => {
    if (request?.status === "closed") {
      toast.error("Cannot convert a closed service request");
      return;
    }

    if (
      !window.confirm("Convert this service request to a job?")
    ) return;

    try {
      await convertServiceRequest(id).unwrap();

      toast.success("Service request converted to job");

      refetch();

      navigate(`/service-requests/${id}`);
    } catch (err) {
      toast.error(
        err?.data?.message || "Failed to convert service request"
      );
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg={8}>
        <Card className="shadow-sm border-0">
          <Card.Body>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="mb-1">Convert Service Request</h4>
                <small className="text-muted">
                  Review before converting to job
                </small>
              </div>

              <Button variant="light" onClick={() => navigate(-1)}>
                ← Back
              </Button>
            </div>

            {/* Basic Info */}
            <Table bordered responsive>
              <tbody>
                <tr>
                  <th>Issue Type</th>
                  <td>{request.issueType}</td>
                </tr>

                <tr>
                  <th>Description</th>
                  <td>{request.description || "No description"}</td>
                </tr>

                <tr>
                  <th>Priority</th>
                  <td>
                    <Badge bg={getPriorityVariant(request.priority)}>
                      {request.priority?.toUpperCase()}
                    </Badge>
                  </td>
                </tr>

                <tr>
                  <th>Status</th>
                  <td>
                    <Badge bg={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </td>
                </tr>

                <tr>
                  <th>Customer</th>
                  <td>
                    {request.customer?.name ||
                      request.customerSnapshot?.name ||
                      "-"}
                  </td>
                </tr>

                <tr>
                  <th>Phone</th>
                  <td>
                    {request.customer?.phone ||
                      request.customerSnapshot?.phone ||
                      "-"}
                  </td>
                </tr>

                <tr>
                  <th>Area</th>
                  <td>{request.area?.name || "-"}</td>
                </tr>

                <tr>
                  <th>Preferred Date</th>
                  <td>
                    {request.preferredDate
                      ? new Date(request.preferredDate).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* Warning */}
            <Alert variant="info" className="mt-3">
              Converting this request will mark it as <b>assigned</b> and move it
              into job workflow.
            </Alert>

            {/* Action */}
            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="success"
                disabled={converting || request.status === "closed"}
                onClick={handleConvert}
              >
                {converting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Converting...
                  </>
                ) : (
                  "Convert to Job"
                )}
              </Button>
            </div>

          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ConvertServiceRequestScreen;