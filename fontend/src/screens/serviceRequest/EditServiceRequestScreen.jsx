import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetServiceRequestDetailsQuery,
  useUpdateServiceRequestMutation,
} from "../../slices/serviceRequestApiSlice";

const ISSUE_TYPES = [
  "AC Repair",
  "AC Installation",
  "Heating Issue",
  "Maintenance",
  "Other",
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

const SOURCES = ["call", "website", "walk-in", "referral"];

const STATUS_OPTIONS = [
  "new",
  "acknowledged",
  "assigned",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "closed",
];

const EditServiceRequestScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * =========================================================
   * AUTH
   * =========================================================
   */
  const { userInfo } = useSelector((state) => state.auth);

  const canEdit =
    userInfo?.role === "manager" ||
    userInfo?.role === "dispatcher";

  /**
   * =========================================================
   * FETCH DATA
   * =========================================================
   */
  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useGetServiceRequestDetailsQuery(id);

  /**
   * =========================================================
   * UPDATE MUTATION
   * =========================================================
   */
  const [
    updateServiceRequest,
    { isLoading: updating },
  ] = useUpdateServiceRequestMutation();

  /**
   * =========================================================
   * LOCAL STATE
   * =========================================================
   */
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    priority: "medium",
    status: "new",
    source: "call",
    preferredDate: "",
  });

  /**
   * =========================================================
   * PREFILL FORM
   * =========================================================
   */
  useEffect(() => {
    if (request) {
      setFormData({
        issueType: request.issueType || "",
        description: request.description || "",
        priority: request.priority || "medium",
        status: request.status || "new",
        source: request.source || "call",
        preferredDate: request.preferredDate
          ? new Date(request.preferredDate)
              .toISOString()
              .slice(0, 16)
          : "",
      });
    }
  }, [request]);

  /**
   * =========================================================
   * ACCESS CONTROL
   * =========================================================
   */
  if (!canEdit) {
    return (
      <Alert variant="danger">
        Access denied. Only Manager or Dispatcher can edit service requests.
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
          "Failed to load service request"}
      </Alert>
    );
  }

  /**
   * =========================================================
   * HANDLERS
   * =========================================================
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateServiceRequest({
        serviceRequestId: id,
        issueType: formData.issueType,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        source: formData.source,
        preferredDate: formData.preferredDate || null,
      }).unwrap();

      toast.success("Service request updated successfully");

      await refetch();

      navigate(`/service-requests/${id}`);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Failed to update service request"
      );
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Edit Service Request</h4>

          <Button variant="light" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>

        {/* ===================================================== */}
        {/* FORM */}
        {/* ===================================================== */}
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* ISSUE TYPE */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Issue Type</Form.Label>

                <Form.Select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Issue Type</option>
                  {ISSUE_TYPES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* PRIORITY */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>

                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.toUpperCase()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* STATUS */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>

                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* SOURCE */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Source</Form.Label>

                <Form.Select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* PREFERRED DATE */}
          <Form.Group className="mb-3">
            <Form.Label>Preferred Date</Form.Label>

            <Form.Control
              type="datetime-local"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
            />
          </Form.Group>

          {/* DESCRIPTION */}
          <Form.Group className="mb-4">
            <Form.Label>Description</Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue..."
            />
          </Form.Group>

          {/* SUBMIT */}
          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="primary"
              disabled={updating}
            >
              {updating ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                "Update Service Request"
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EditServiceRequestScreen;