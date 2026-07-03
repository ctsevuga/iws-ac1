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
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaUser,
  FaTools,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPhone,
  FaClipboardCheck,
} from "react-icons/fa";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import { toast } from "react-toastify";

import {
  useGetJobDetailsQuery,
  useDeleteJobMutation,
} from "../../slices/jobApiSlice";

const JobDetailsScreen = () => {
  const navigate = useNavigate();

  const { id: jobId } = useParams();

  /**
   * =========================================================
   * AUTH
   * =========================================================
   */

  const { userInfo } = useSelector((state) => state.auth);

  const role = userInfo?.role;

  /**
   * =========================================================
   * ACCESS CONTROL
   * =========================================================
   */

  const canEdit =
    role === "admin" || role === "manager" || role === "dispatcher";

  const canDelete = role === "admin" || role === "manager";

  /**
   * =========================================================
   * GET JOB DETAILS
   * =========================================================
   */

  const { data: job, isLoading, error } = useGetJobDetailsQuery(jobId);

  /**
   * =========================================================
   * DELETE JOB
   * =========================================================
   */

  const [deleteJob, { isLoading: loadingDelete }] = useDeleteJobMutation();

  const deleteHandler = async () => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(jobId).unwrap();

        toast.success("Job deleted");

        navigate("/jobs");
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete job");
      }
    }
  };

  /**
   * =========================================================
   * STATUS BADGES
   * =========================================================
   */

  const getStatusVariant = (status) => {
    switch (status) {
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
   * PRIORITY BADGES
   * =========================================================
   */

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
        return "dark";
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
        {error?.data?.message || "Failed to load job details"}
      </Alert>
    );
  }

  /**
   * =========================================================
   * COMPONENT
   * =========================================================
   */

  return (
    <>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="light"
            className="mb-3"
            onClick={() => navigate("/jobs")}
          >
            <FaArrowLeft className="me-2" />
            Back to Jobs
          </Button>

          <h3 className="mb-1">Job Details</h3>

          <p className="text-muted mb-0">Job ID: {job?._id}</p>
        </div>

        {/* ACTION BUTTONS */}

        <div className="d-flex gap-2">
          {canEdit && (
            <Button as={Link} to={`/jobs/${job._id}/edit`} variant="success">
              <FaEdit className="me-2" />
              Edit
            </Button>
          )}

          {canDelete && (
            <Button
              variant="danger"
              onClick={deleteHandler}
              disabled={loadingDelete}
            >
              <FaTrash className="me-2" />

              {loadingDelete ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}

      <Row>
        {/* ===================================================== */}
        {/* LEFT COLUMN */}
        {/* ===================================================== */}

        <Col lg={8}>
          {/* JOB OVERVIEW */}

          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h4 className="mb-2">{job?.serviceType}</h4>

                  <div className="d-flex gap-2 flex-wrap">
                    <Badge bg={getStatusVariant(job?.status)}>
                      {job?.status}
                    </Badge>

                    <Badge bg={getPriorityVariant(job?.priority)}>
                      {job?.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              <ListGroup variant="flush">
                {/* SCHEDULE */}

                <ListGroup.Item className="px-0">
                  <FaCalendarAlt className="me-2 text-muted" />
                  <strong>Scheduled:</strong>{" "}
                  {job?.scheduledAt
                    ? new Date(job.scheduledAt).toLocaleString()
                    : "Not Scheduled"}
                </ListGroup.Item>

                {/* LOCATION */}

                <ListGroup.Item className="px-0">
                  <FaMapMarkerAlt className="me-2 text-muted" />
                  <strong>Location:</strong>{" "}
                  {job?.location || "No location provided"}
                </ListGroup.Item>

                {/* ESTIMATED COST */}

                <ListGroup.Item className="px-0">
                  <strong>Estimated Cost:</strong> ${job?.estimatedCost || 0}
                </ListGroup.Item>

                {/* ACTUAL COST */}

                <ListGroup.Item className="px-0">
                  <strong>Actual Cost:</strong> ${job?.actualCost || 0}
                </ListGroup.Item>

                {/* NOTES */}

                <ListGroup.Item className="px-0">
                  <strong>Notes:</strong>

                  <div className="mt-2">{job?.notes || "No notes added"}</div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          {/* SERVICE REQUEST */}

          {job?.serviceRequest && (
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Service Request</h5>

                <ListGroup variant="flush">
                  <ListGroup.Item className="px-0">
                    <strong>Issue Type:</strong> {job.serviceRequest?.issueType}
                  </ListGroup.Item>

                  <ListGroup.Item className="px-0">
                    <strong>Request Status:</strong>{" "}
                    {job.serviceRequest?.status}
                  </ListGroup.Item>

                  <ListGroup.Item className="px-0">
                    <strong>Priority:</strong> {job.serviceRequest?.priority}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* ===================================================== */}
        {/* RIGHT COLUMN */}
        {/* ===================================================== */}

        <Col lg={4}>
          {/* CUSTOMER */}

          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-3">
                <FaUser className="me-2" />
                Customer
              </h5>

              <div className="mb-2 fw-semibold">{job?.customer?.name}</div>

              <div className="text-muted">
                <FaPhone className="me-2" />
                {job?.customer?.phone}
              </div>
            </Card.Body>
          </Card>

          {/* TECHNICIAN */}

          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-3">
                <FaTools className="me-2" />
                Technician
              </h5>

              {job?.technician ? (
                <>
                  <div className="mb-2 fw-semibold">{job.technician?.name}</div>

                  <div className="text-muted">
                    <FaPhone className="me-2" />
                    {job.technician?.user?.phone || "No phone"}
                  </div>
                </>
              ) : (
                <Alert variant="secondary">No technician assigned</Alert>
              )}
            </Card.Body>
          </Card>

          {/* WORKFLOW */}

          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">
                <FaClipboardCheck className="me-2" />
                Workflow
              </h5>

              <ListGroup variant="flush">
                <ListGroup.Item className="px-0">
                  Created:
                  <div className="text-muted small">
                    {new Date(job?.createdAt).toLocaleString()}
                  </div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0">
                  Last Updated:
                  <div className="text-muted small">
                    {new Date(job?.updatedAt).toLocaleString()}
                  </div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0">
                  Current Status:
                  <div className="mt-2">
                    <Badge bg={getStatusVariant(job?.status)}>
                      {job?.status}
                    </Badge>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default JobDetailsScreen;
