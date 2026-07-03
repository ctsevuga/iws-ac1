import { useEffect, useState } from "react";

import {
  Card,
  Button,
  Form,
  Badge,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaTools,
} from "react-icons/fa";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";

import { toast } from "react-toastify";

import {
  useGetJobDetailsQuery,
  useUpdateJobStatusMutation,
} from "../../slices/jobApiSlice";

const JobStatusUpdateScreen = () => {
  const navigate = useNavigate();

  const { id: jobId } = useParams();

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

  const allowedRoles = [
    "admin",
    "manager",
    "dispatcher",
    "technician",
  ];

  const hasAccess =
    allowedRoles.includes(role);

  /**
   * =========================================================
   * GET JOB DETAILS
   * =========================================================
   */

  const {
    data: job,
    isLoading,
    error,
  } = useGetJobDetailsQuery(jobId);

  /**
   * =========================================================
   * UPDATE STATUS MUTATION
   * =========================================================
   */

  const [
    updateJobStatus,
    {
      isLoading: loadingUpdate,
    },
  ] = useUpdateJobStatusMutation();

  /**
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [status, setStatus] =
    useState("");

  useEffect(() => {
    if (job) {
      setStatus(job.status);
    }
  }, [job]);

  /**
   * =========================================================
   * STATUS OPTIONS
   * =========================================================
   */

  const technicianStatuses = [
    "assigned",
    "enroute",
    "in_progress",
    "completed",
  ];

  const adminStatuses = [
    "scheduled",
    "assigned",
    "enroute",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const statusOptions =
    role === "technician"
      ? technicianStatuses
      : adminStatuses;

  /**
   * =========================================================
   * STATUS BADGE COLORS
   * =========================================================
   */

  const getStatusVariant = (
    currentStatus
  ) => {
    switch (currentStatus) {
      case "scheduled":
        return "secondary";

      case "assigned":
        return "info";

      case "enroute":
        return "primary";

      case "in_progress":
        return "warning";

      case "completed":
        return "success";

      case "cancelled":
        return "danger";

      default:
        return "dark";
    }
  };

  /**
   * =========================================================
   * SUBMIT HANDLER
   * =========================================================
   */

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateJobStatus({
        jobId,
        status,
      }).unwrap();

      toast.success(
        "Job status updated successfully"
      );

      navigate(`/jobs/${jobId}`);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Failed to update status"
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
        You do not have permission to
        update job statuses.
      </Alert>
    );
  }

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
          "Failed to load job"}
      </Alert>
    );
  }

  /**
   * =========================================================
   * COMPONENT
   * =========================================================
   */

  return (
    <Row className="justify-content-center">
      <Col lg={7}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="mb-4">
              <Button
                variant="light"
                className="mb-3"
                onClick={() =>
                  navigate(
                    `/jobs/${jobId}`
                  )
                }
              >
                <FaArrowLeft className="me-2" />
                Back to Job
              </Button>

              <h3 className="mb-1">
                Update Job Status
              </h3>

              <p className="text-muted mb-0">
                Update workflow progress for
                this service job
              </p>
            </div>

            {/* ================================================= */}
            {/* JOB SUMMARY */}
            {/* ================================================= */}

            <Card className="bg-light border-0 mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div>
                    <h5 className="mb-2">
                      {job?.serviceType}
                    </h5>

                    <div className="text-muted small">
                      Job ID: {job?._id}
                    </div>
                  </div>

                  <div>
                    <Badge
                      bg={getStatusVariant(
                        job?.status
                      )}
                      className="px-3 py-2"
                    >
                      {job?.status}
                    </Badge>
                  </div>
                </div>

                <hr />

                <div className="small">
                  <div className="mb-2">
                    <strong>
                      Customer:
                    </strong>{" "}
                    {
                      job?.customer
                        ?.name
                    }
                  </div>

                  <div className="mb-2">
                    <strong>
                      Technician:
                    </strong>{" "}
                    {job?.technician
                      ?.name || (
                      <span className="text-muted">
                        Unassigned
                      </span>
                    )}
                  </div>

                  <div>
                    <strong>
                      Current Status:
                    </strong>{" "}
                    <Badge
                      bg={getStatusVariant(
                        job?.status
                      )}
                    >
                      {job?.status}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* ================================================= */}
            {/* FORM */}
            {/* ================================================= */}

            <Form onSubmit={submitHandler}>
              <Form.Group
                controlId="status"
                className="mb-4"
              >
                <Form.Label>
                  New Status
                </Form.Label>

                <Form.Select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                >
                  {statusOptions.map(
                    (
                      statusOption
                    ) => (
                      <option
                        key={
                          statusOption
                        }
                        value={
                          statusOption
                        }
                      >
                        {statusOption}
                      </option>
                    )
                  )}
                </Form.Select>

                {/* TECHNICIAN INFO */}

                {role ===
                  "technician" && (
                  <div className="mt-2 text-muted small">
                    Technicians can only
                    update statuses for
                    jobs assigned to them.
                  </div>
                )}
              </Form.Group>

              {/* ================================================= */}
              {/* ACTION BUTTONS */}
              {/* ================================================= */}

              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    loadingUpdate
                  }
                >
                  {loadingUpdate ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" />
                      Update Status
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    navigate(
                      `/jobs/${jobId}`
                    )
                  }
                >
                  Cancel
                </Button>
              </div>
            </Form>

            {/* ================================================= */}
            {/* WORKFLOW GUIDE */}
            {/* ================================================= */}

            <Card className="mt-4 border-0 bg-light">
              <Card.Body>
                <h6 className="mb-3">
                  <FaTools className="me-2" />
                  Workflow Status Guide
                </h6>

                <div className="small">
                  <div className="mb-2">
                    <Badge bg="secondary">
                      scheduled
                    </Badge>{" "}
                    Job is scheduled but not
                    assigned
                  </div>

                  <div className="mb-2">
                    <Badge bg="info">
                      assigned
                    </Badge>{" "}
                    Technician assigned
                  </div>

                  <div className="mb-2">
                    <Badge bg="primary">
                      enroute
                    </Badge>{" "}
                    Technician is traveling
                  </div>

                  <div className="mb-2">
                    <Badge bg="warning">
                      in_progress
                    </Badge>{" "}
                    Work is actively being
                    performed
                  </div>

                  <div className="mb-2">
                    <Badge bg="success">
                      completed
                    </Badge>{" "}
                    Job successfully completed
                  </div>

                  <div>
                    <Badge bg="danger">
                      cancelled
                    </Badge>{" "}
                    Job cancelled
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default JobStatusUpdateScreen;