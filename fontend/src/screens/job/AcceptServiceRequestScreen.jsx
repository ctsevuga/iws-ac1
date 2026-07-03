import { useState } from "react";

import {
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Row,
  Col,
} from "react-bootstrap";

import { useParams, useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import { toast } from "react-toastify";

import {
  useAcceptServiceRequestMutation,
} from "../../slices/jobApiSlice";

import {
  useGetServiceRequestAcceptPreviewQuery,
} from "../../slices/serviceRequestApiSlice";

const AcceptServiceRequestScreen = () => {
  const navigate = useNavigate();
  const { serviceRequestId } = useParams();
  const {
  data: serviceRequest,
  isLoading,
  error,
} = useGetServiceRequestAcceptPreviewQuery(
  serviceRequestId
);

  /**
   * =========================================================
   * AUTH
   * =========================================================
   */

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const role = userInfo?.role;

  /**
   * =========================================================
   * ACCESS CONTROL
   * =========================================================
   */

  const hasAccess = role === "technician";

  /**
   * =========================================================
   * MUTATION
   * =========================================================
   */

  const [
    acceptServiceRequest,
    // { isLoading },
  ] = useAcceptServiceRequestMutation();

  /**
   * =========================================================
   * HANDLER
   * =========================================================
   */

  const acceptHandler = async () => {
    try {
      const res =
        await acceptServiceRequest(
          serviceRequest._id
        ).unwrap();

      toast.success(
        "Job assigned successfully"
      );

      navigate(
        `/jobs/${res.job._id}`
      );
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Failed to accept request"
      );
    }
  };

  /**
   * =========================================================
   * ACCESS DENIED
   * =========================================================
   */

  if (!hasAccess) {
    return (
      <Alert variant="danger">
        Only technicians can accept service
        requests.
      </Alert>
    );
  }

  /**
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            {/* HEADER */}

            <h4 className="mb-3">
              Accept Service Request
            </h4>

            {/* REQUEST DETAILS */}

            <Card className="mb-4 bg-light border-0">
              <Card.Body>
                <div className="mb-2">
                  <strong>Customer:</strong>{" "}
                  {
                    serviceRequest
                      ?.customer?.name
                  }
                </div>

                <div className="mb-2">
                  <strong>
                    Issue Type:
                  </strong>{" "}
                  {
                    serviceRequest?.issueType
                  }
                </div>

                <div className="mb-2">
                  <strong>
                    Priority:
                  </strong>{" "}
                  <Badge bg="info">
                    {
                      serviceRequest?.priority
                    }
                  </Badge>
                </div>

                <div>
                  <strong>
                    Status:
                  </strong>{" "}
                  <Badge bg="secondary">
                    {
                      serviceRequest?.status
                    }
                  </Badge>
                </div>
              </Card.Body>
            </Card>

            {/* WARNING */}

            <Alert variant="danger">
              If the job is accepted by another technician, 
              it is no longer available for taking.
              
            </Alert>
            <Alert variant="warning">
              Once accepted, this request will
              be assigned to you and a job will
              be created automatically.
            </Alert>

            {/* ACTION BUTTON */}

            <div className="d-grid gap-2">
              <Button
                variant="success"
                onClick={
                  acceptHandler
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Accepting...
                  </>
                ) : (
                  "Accept & Create Job"
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  navigate(-1)
                }
              >
                Cancel
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AcceptServiceRequestScreen;