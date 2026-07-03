import { useEffect, useState, useMemo } from "react";

import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";

import { useNavigate, useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import { toast } from "react-toastify";

import {
  useGetJobDetailsQuery,
  useUpdateJobMutation,
} from "../../slices/jobApiSlice";

import { useGetAreasQuery } from "../../slices/areaApiSlice";

import { useGetTechniciansQuery } from "../../slices/technicianApiSlice";

const JobEditScreen = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();

  const { userInfo } = useSelector((state) => state.auth);

  const allowedRoles = ["admin", "manager", "dispatcher"];
  const hasAccess = allowedRoles.includes(userInfo?.role);

  /**
   * JOB DETAILS
   */
  const { data: job, isLoading, error } = useGetJobDetailsQuery(jobId);

  /**
   * AREAS
   */
  const {
    data: areaData,
    isLoading: areasLoading,
    error: areasError,
  } = useGetAreasQuery();

  const areas = areaData?.areas || [];

  /**
   * TECHNICIANS (FIXED)
   */
  const {
    data: technicianData,
    isLoading: techniciansLoading,
    error: techniciansError,
  } = useGetTechniciansQuery();

  const technicians = technicianData?.technicians || [];

  /**
   * UPDATE JOB
   */
  const [updateJob, { isLoading: loadingUpdate }] = useUpdateJobMutation();

  /**
   * FORM STATE
   */
  const [serviceType, setServiceType] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [technician, setTechnician] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  /**
   * LOAD JOB
   */
  useEffect(() => {
    if (job) {
      setServiceType(job.serviceType || "");
      setScheduledAt(
        job.scheduledAt
          ? new Date(job.scheduledAt).toISOString().slice(0, 16)
          : ""
      );
      setTechnician(job.technician?._id || "");
      setStatus(job.status || "");
      setPriority(job.priority || "medium");
      setNotes(job.notes || "");
      setLocation(job.location || "");
      setEstimatedCost(job.estimatedCost || "");
      setActualCost(job.actualCost || "");
      setSelectedArea(job.area?._id || "");
    }
  }, [job]);

  /**
   * FILTER TECHNICIANS BY AREA (FIXED LOGIC)
   */
  const filteredTechnicians = useMemo(() => {
    if (!selectedArea) return technicians;

    return technicians.filter((tech) => {
      const techAreas = tech.areas || [];

      return techAreas.some((a) => {
        if (!a) return false;
        if (typeof a === "string") return a === selectedArea;
        return a._id === selectedArea;
      });
    });
  }, [technicians, selectedArea]);

  /**
   * SUBMIT
   */
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateJob({
        jobId,
        serviceType,
        scheduledAt,
        technician: technician || null,
        status,
        priority,
        notes,
        location,
        estimatedCost,
        actualCost,
      }).unwrap();

      toast.success("Job updated successfully");
      navigate(`/jobs/${jobId}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update job");
    }
  };

  /**
   * ACCESS CONTROL
   */
  if (!hasAccess) {
    return (
      <Alert variant="danger">
        You do not have permission to edit jobs.
      </Alert>
    );
  }

  /**
   * LOADING
   */
  if (isLoading || areasLoading || techniciansLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /**
   * ERRORS
   */
  if (error) {
    return (
      <Alert variant="danger">
        {error?.data?.message || "Failed to load job"}
      </Alert>
    );
  }

  if (areasError) {
    return (
      <Alert variant="danger">
        {areasError?.data?.message || "Failed to load areas"}
      </Alert>
    );
  }

  if (techniciansError) {
    return (
      <Alert variant="danger">
        {techniciansError?.data?.message || "Failed to load technicians"}
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="mb-1">Edit Job</h3>
            <p className="text-muted mb-0">
              Update job assignment and workflow
            </p>
          </div>
        </div>

        <Form onSubmit={submitHandler}>
          <Row>

            {/* AREA */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Area</Form.Label>
                <Form.Select
                  value={selectedArea}
                  onChange={(e) => {
                    setSelectedArea(e.target.value);
                    setTechnician("");
                  }}
                >
                  <option value="">All Areas</option>
                  {areas.map((area) => (
                    <option key={area._id} value={area._id}>
                      {area.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* TECHNICIAN */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Technician</Form.Label>
                <Form.Select
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                >
                  <option value="">Unassigned</option>

                  {filteredTechnicians.length === 0 ? (
                    <option disabled>No technicians found</option>
                  ) : (
                    filteredTechnicians.map((tech) => (
                      <option key={tech._id} value={tech._id}>
                        {tech.name}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* SERVICE TYPE */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Service Type</Form.Label>
                <Form.Control
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* STATUS */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="assigned">Assigned</option>
                  <option value="enroute">En Route</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* NOTES */}
            <Col md={12} className="mb-4">
              <Form.Group>
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
            </Col>

          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" disabled={loadingUpdate}>
              {loadingUpdate ? "Updating..." : "Update Job"}
            </Button>

            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default JobEditScreen;