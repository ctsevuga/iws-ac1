import React, { useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";

import {
  FaClipboardList,
  FaEye,
  FaTimesCircle,
  FaArrowLeft,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import {
  useGetMyServiceRequestsQuery,
  useCancelServiceRequestMutation,
} from "../../slices/customerServiceApiSlice";

const CustomerServiceRequestListScreen = () => {
  const navigate = useNavigate();

  // =====================================================
  // TENANT FROM URL
  // =====================================================
  const { companySlug } = useParams();
  console.log(companySlug);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // =====================================================
  // API CALL (TENANT-AWARE)
  // =====================================================
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useGetMyServiceRequestsQuery(companySlug);

  const [cancelServiceRequest, { isLoading: cancelling }] =
    useCancelServiceRequestMutation();

  // =====================================================
  // BADGE COLORS
  // =====================================================
  const getStatusVariant = (status) => {
    switch (status) {
      case "open":
        return "primary";
      case "assigned":
        return "warning";
      case "converted":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
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
        return "info";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // =====================================================
  // VIEW REQUEST
  // =====================================================
  const viewHandler = (requestId) => {
    navigate(
      `/${companySlug}/service-requests/${requestId}`
    );
  };

  // =====================================================
  // CANCEL REQUEST
  // =====================================================
  const openCancelModal = (request) => {
    setSelectedRequest(request);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedRequest(null);
  };

  const cancelHandler = async () => {
    if (!selectedRequest) return;

    try {
      await cancelServiceRequest(
        selectedRequest._id
      ).unwrap();

      toast.success("Service request cancelled successfully");

      closeCancelModal();
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Failed to cancel service request"
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h3 className="fw-bold text-primary">
            <FaClipboardList className="me-2" />
            My Service Requests
          </h3>
        </Col>
        <Col className="text-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/${companySlug}/dashboard`)}
                  >
                    <FaArrowLeft className="me-2" />
                    Back
                  </Button>
                </Col>
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-danger text-center">
            {error?.data?.message ||
              "Failed to load service requests"}
          </Card.Body>
        </Card>
      ) : requests?.length === 0 ? (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center py-5">
            <FaClipboardList
              size={50}
              className="text-muted mb-3"
            />

            <h5>No Service Requests Found</h5>

            <p className="text-muted mb-0">
              You have not created any service requests yet.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Table responsive hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Issue Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Area</th>
                  <th>Preferred Date</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {requests?.map((request, index) => (
                  <tr key={request._id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{request.issueType}</strong>
                    </td>

                    <td>
                      <Badge
                        bg={getPriorityVariant(
                          request.priority
                        )}
                      >
                        {request.priority}
                      </Badge>
                    </td>

                    <td>
                      <Badge
                        bg={getStatusVariant(request.status)}
                      >
                        {request.status}
                      </Badge>
                    </td>

                    <td>{request.area?.name || "-"}</td>

                    <td>
                      {request.preferredDate ? (
                        <>
                          <FaCalendarAlt className="me-1 text-success" />
                          {new Date(
                            request.preferredDate
                          ).toLocaleDateString()}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {new Date(
                        request.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            viewHandler(request._id)
                          }
                        >
                          <FaEye className="me-1" />
                          View
                        </Button>

                        {request.status !== "cancelled" &&
                          request.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() =>
                                openCancelModal(request)
                              }
                            >
                              <FaTimesCircle className="me-1" />
                              Cancel
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}
      <Modal show={showCancelModal} onHide={closeCancelModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Confirm Cancellation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedRequest && (
            <>
              <p>Are you sure you want to cancel this service request?</p>

              <Card className="bg-light border-0">
                <Card.Body>
                  <div>
                    <strong>Issue Type:</strong>{" "}
                    {selectedRequest.issueType}
                  </div>

                  <div>
                    <strong>Priority:</strong>{" "}
                    {selectedRequest.priority}
                  </div>

                  <div>
                    <strong>Status:</strong>{" "}
                    {selectedRequest.status}
                  </div>
                </Card.Body>
              </Card>

              <div className="text-danger mt-3">
                This action cannot be undone.
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeCancelModal}
            disabled={cancelling}
          >
            Keep Request
          </Button>

          <Button
            variant="danger"
            onClick={cancelHandler}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cancelling...
              </>
            ) : (
              <>
                <FaTimesCircle className="me-2" />
                Cancel Request
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CustomerServiceRequestListScreen;