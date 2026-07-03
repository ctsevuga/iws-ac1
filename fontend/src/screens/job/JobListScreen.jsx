import { useState } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Form,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";

import { FaEye, FaEdit, FaTrash, FaPlus, FaTasks } from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { toast } from "react-toastify";

import {
  useGetJobsQuery,
  useDeleteJobMutation,
} from "../../slices/jobApiSlice";

const JobListScreen = () => {
  const navigate = useNavigate();

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

  const canCreate =
    role === "admin" || role === "manager" || role === "dispatcher";

  const canEdit =
    role === "admin" || role === "manager" || role === "dispatcher";

  const canDelete = role === "admin" || role === "manager";

  /**
   * =========================================================
   * FILTERS
   * =========================================================
   */

  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("");

  /**
   * =========================================================
   * GET JOBS
   * =========================================================
   */

  const { data, isLoading, error, refetch } = useGetJobsQuery({
    page,
    limit: 20,
    status,
  });

  /**
   * =========================================================
   * DELETE JOB
   * =========================================================
   */

  const [deleteJob, { isLoading: loadingDelete }] = useDeleteJobMutation();

  const deleteHandler = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(jobId).unwrap();

        toast.success("Job deleted");

        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete job");
      }
    }
  };

  /**
   * =========================================================
   * STATUS BADGE
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
        {error?.data?.message || "Failed to load jobs"}
      </Alert>
    );
  }

  /**
   * =========================================================
   * COMPONENT
   * =========================================================
   */

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <Row className="align-items-center mb-4">
          <Col md={6}>
            <div>
              <h3 className="mb-1">Jobs</h3>

              <p className="text-muted mb-0">
                Manage service jobs and field operations
              </p>
            </div>
          </Col>

          <Col md={6} className="text-md-end mt-3 mt-md-0">
            {canCreate && (
              <Button onClick={() => navigate("/jobs/create")}>
                <FaPlus className="me-2" />
                Create Job
              </Button>
            )}
          </Col>
        </Row>

        {/* ===================================================== */}
        {/* FILTERS */}
        {/* ===================================================== */}

        <Row className="mb-4">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Filter by Status</Form.Label>

              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>

                <option value="scheduled">Scheduled</option>

                <option value="assigned">Assigned</option>

                <option value="enroute">En Route</option>

                <option value="in_progress">In Progress</option>

                <option value="completed">Completed</option>

                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* ===================================================== */}
        {/* DELETE LOADING */}
        {/* ===================================================== */}

        {loadingDelete && (
          <div className="mb-3">
            <Spinner animation="border" size="sm" />
          </div>
        )}

        {/* ===================================================== */}
        {/* TABLE */}
        {/* ===================================================== */}

        <div className="table-responsive">
          <Table striped hover bordered className="align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>

                <th>Customer</th>

                <th>Technician</th>

                <th>Service Type</th>

                <th>Status</th>

                <th>Priority</th>

                <th>Scheduled</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data?.jobs?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No jobs found
                  </td>
                </tr>
              ) : (
                data?.jobs?.map((job) => (
                  <tr key={job._id}>
                    {/* ID */}

                    <td>{job._id.slice(-6)}</td>

                    {/* CUSTOMER */}

                    <td>
                      <div>
                        <div className="fw-semibold">{job.customer?.name}</div>

                        <small className="text-muted">
                          {job.customer?.phone}
                        </small>
                      </div>
                    </td>

                    {/* TECHNICIAN */}

                    <td>
                      {job.technician ? (
                        <div>
                          <div className="fw-semibold">
                            {job.technician?.name}
                          </div>

                          <small className="text-muted">
                            {job.technician?.user?.phone || "No phone"}
                          </small>
                        </div>
                      ) : (
                        <Badge bg="secondary">Unassigned</Badge>
                      )}
                    </td>

                    {/* SERVICE TYPE */}

                    <td>{job.serviceType}</td>

                    {/* STATUS */}

                    <td>
                      <Badge bg={getStatusVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </td>

                    {/* PRIORITY */}

                    <td>
                      <Badge
                        bg={
                          job.priority === "urgent"
                            ? "danger"
                            : job.priority === "high"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {job.priority}
                      </Badge>
                    </td>

                    {/* SCHEDULED */}

                    <td>
                      {job.scheduledAt
                        ? new Date(job.scheduledAt).toLocaleString()
                        : "--"}
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        {/* VIEW */}

                        <Button
                          as={Link}
                          to={`/jobs/${job._id}`}
                          size="sm"
                          variant="outline-primary"
                        >
                          <FaEye />
                        </Button>

                        {/* UPDATE STATUS */}

                        <Button
                          as={Link}
                          to={`/jobs/${job._id}/status`}
                          size="sm"
                          variant="outline-warning"
                          title="Update Status"
                        >
                          <FaTasks />
                        </Button>

                        {/* EDIT */}

                        {canEdit && (
                          <Button
                            as={Link}
                            to={`/jobs/${job._id}/edit`}
                            size="sm"
                            variant="outline-success"
                          >
                            <FaEdit />
                          </Button>
                        )}

                        {/* DELETE */}

                        {canDelete && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteHandler(job._id)}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* ===================================================== */}
        {/* PAGINATION */}
        {/* ===================================================== */}

        {data?.pages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              {[...Array(data.pages).keys()].map((x) => (
                <Pagination.Item
                  key={x + 1}
                  active={x + 1 === page}
                  onClick={() => setPage(x + 1)}
                >
                  {x + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default JobListScreen;
