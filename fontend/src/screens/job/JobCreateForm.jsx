import { useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";

import { useCreateJobMutation } from "../../slices/jobApiSlice";

const JobCreateForm = ({
  customers = [],
  technicians = [],
  serviceRequests = [],
}) => {
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  /**
   * =========================================================
   * ACCESS CONTROL
   * =========================================================
   */

  const allowedRoles = ["admin", "manager", "dispatcher"];

  const hasAccess = allowedRoles.includes(userInfo?.role);

  /**
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [serviceRequest, setServiceRequest] = useState("");
  const [customer, setCustomer] = useState("");
  const [technician, setTechnician] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [priority, setPriority] = useState("medium");

  /**
   * =========================================================
   * RTK MUTATION
   * =========================================================
   */

  const [createJob, { isLoading }] =
    useCreateJobMutation();

  /**
   * =========================================================
   * SUBMIT HANDLER
   * =========================================================
   */

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (!customer) {
        toast.error("Customer is required");
        return;
      }

      if (!serviceType) {
        toast.error("Service type is required");
        return;
      }

      const payload = {
        serviceRequest:
          serviceRequest || null,

        customer,

        technician:
          technician || null,

        serviceType,

        scheduledAt:
          scheduledAt || null,

        notes,

        location,

        estimatedCost:
          estimatedCost || 0,

        priority,
      };

      const res = await createJob(payload).unwrap();

      toast.success("Job created successfully");

      navigate(`/jobs/${res._id}`);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to create job"
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
        You do not have permission to create jobs.
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="mb-1">
              Create Job
            </h3>

            <p className="text-muted mb-0">
              Manual dispatch & scheduling
            </p>
          </div>
        </div>

        <Form onSubmit={submitHandler}>
          <Row>
            {/* ===================================================== */}
            {/* SERVICE REQUEST */}
            {/* ===================================================== */}

            <Col md={6} className="mb-3">
              <Form.Group controlId="serviceRequest">
                <Form.Label>
                  Service Request
                </Form.Label>

                <Form.Select
                  value={serviceRequest}
                  onChange={(e) =>
                    setServiceRequest(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Service Request
                  </option>

                  {serviceRequests.map((sr) => (
                    <option
                      key={sr._id}
                      value={sr._id}
                    >
                      {sr.issueType} -{" "}
                      {sr.customer?.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* ===================================================== */}
            {/* CUSTOMER */}
            {/* ===================================================== */}

            <Col md={6} className="mb-3">
              <Form.Group controlId="customer">
                <Form.Label>
                  Customer *
                </Form.Label>

                <Form.Select
                  required
                  value={customer}
                  onChange={(e) =>
                    setCustomer(e.target.value)
                  }
                >
                  <option value="">
                    Select Customer
                  </option>

                  {customers.map((cust) => (
                    <option
                      key={cust._id}
                      value={cust._id}
                    >
                      {cust.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* ===================================================== */}
            {/* TECHNICIAN */}
            {/* ===================================================== */}

            <Col md={6} className="mb-3">
              <Form.Group controlId="technician">
                <Form.Label>
                  Technician
                </Form.Label>

                <Form.Select
                  value={technician}
                  onChange={(e) =>
                    setTechnician(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Auto Assign / Unassigned
                  </option>

                  {technicians.map((tech) => (
                    <option
                      key={tech._id}
                      value={tech._id}
                    >
                      {tech.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* ===================================================== */}
            {/* SERVICE TYPE */}
            {/* ===================================================== */}

            <Col md={6} className="mb-3">
              <Form.Group controlId="serviceType">
                <Form.Label>
                  Service Type *
                </Form.Label>

                <Form.Control
                  type="text"
                  required
                  placeholder="HVAC Repair"
                  value={serviceType}
                  onChange={(e) =>
                    setServiceType(
                      e.target.value
                    )
                  }
                />
              </Form.Group>
            </Col>

            {/* ===================================================== */}
            {/* PRIORITY */}
            {/* ===================================================== */}

            <Col md={6} className="mb-3">
              <Form.Group controlId="priority">
                <Form.Label>
                  Priority
                </Form.Label>

                <Form.Select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value
                    )
                  }
                >
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

            {/* ===================================================== */}
            {/* SCHEDULED DATE */}
            {/* ===================================================== */}

            <Col md={6} className="mb-3">
              <Form.Group controlId="scheduledAt">
                <Form.Label>
                  Scheduled Date
                </Form.Label>

                <Form.Control
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) =>
                    setScheduledAt(
                      e.target.value
                    )
                  }
                />
              </Form.Group>
            </Col>

            {/* ===================================================== */}
            {/* LOCATION */}
            {/* ===================================================== */}

            <Col md={12} className="mb-3">
              <Form.Group controlId="location">
                <Form.Label>
                  Location
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="123 Main Street"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                />
              </Form.Group>
            </Col>

            {/* ===================================================== */}
            {/* ESTIMATED COST */}
            {/* ===================================================== */}

            <Col md={6} className="mb-3">
              <Form.Group controlId="estimatedCost">
                <Form.Label>
                  Estimated Cost
                </Form.Label>

                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={estimatedCost}
                  onChange={(e) =>
                    setEstimatedCost(
                      e.target.value
                    )
                  }
                />
              </Form.Group>
            </Col>

            {/* ===================================================== */}
            {/* NOTES */}
            {/* ===================================================== */}

            <Col md={12} className="mb-4">
              <Form.Group controlId="notes">
                <Form.Label>
                  Notes
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Additional dispatch notes..."
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* ===================================================== */}
          {/* ACTIONS */}
          {/* ===================================================== */}

          <div className="d-flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Creating...
                </>
              ) : (
                "Create Job"
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                navigate("/jobs")
              }
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default JobCreateForm;