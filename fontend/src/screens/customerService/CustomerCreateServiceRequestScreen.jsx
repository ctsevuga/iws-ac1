import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  FaClipboardList,
  FaTools,
  FaCalendarAlt,
  FaExclamationCircle,
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import { useCreateServiceRequestMutation } from "../../slices/customerServiceApiSlice";

const CustomerCreateServiceRequestScreen = () => {
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [preferredDate, setPreferredDate] = useState("");
  console.log(companySlug);
  const [createServiceRequest, { isLoading }] =
    useCreateServiceRequestMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!issueType.trim()) {
      toast.error("Issue type is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      if (!companySlug) {
        toast.error("Company context missing from URL");
        return;
      }

      await createServiceRequest({
        companySlug,
        data: {
          issueType,
          description,
          priority,
          preferredDate: preferredDate || undefined,
        },
      }).unwrap();

      toast.success("Service request submitted successfully");

      navigate(`/${companySlug}/service-requests`);
    } catch (err) {
      toast.error(
        err?.data?.message || err?.error || "Failed to create service request",
      );
    }
  };

  return (
    <Container className="py-4">
      <Row>
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
      <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white py-3">
              <h4 className="mb-0 fw-bold">
                <FaClipboardList className="me-2" />
                Create Service Request
              </h4>
            </Card.Header>

            <Card.Body className="p-4">
              <Alert variant="info">
                <FaTools className="me-2" />
                Submit a service request and available technicians in your
                service area will be notified automatically.
              </Alert>

              <Form onSubmit={submitHandler}>
                {/* ISSUE TYPE */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <FaTools className="me-2 text-primary" />
                    Issue Type
                  </Form.Label>

                  <Form.Select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    required
                  >
                    <option value="">Select Issue Type</option>

                    <option value="AC Not Cooling">AC Not Cooling</option>

                    <option value="AC Not Working">AC Not Working</option>

                    <option value="Water Leakage">Water Leakage</option>

                    <option value="Gas Refill">Gas Refill</option>

                    <option value="Compressor Issue">Compressor Issue</option>

                    <option value="Electrical Problem">
                      Electrical Problem
                    </option>

                    <option value="Routine Maintenance">
                      Routine Maintenance
                    </option>

                    <option value="Installation">Installation</option>

                    <option value="Noise Issue">Noise Issue</option>

                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>

                {/* DESCRIPTION */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <FaClipboardList className="me-2 text-primary" />
                    Description
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* PRIORITY */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <FaExclamationCircle className="me-2 text-danger" />
                    Priority
                  </Form.Label>

                  <Form.Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>

                    <option value="medium">Medium</option>

                    <option value="high">High</option>

                    <option value="urgent">Urgent</option>
                  </Form.Select>
                </Form.Group>

                {/* PREFERRED DATE */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <FaCalendarAlt className="me-2 text-success" />
                    Preferred Service Date
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={preferredDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                  />

                  <Form.Text className="text-muted">
                    Optional. Leave blank if no preferred date.
                  </Form.Text>
                </Form.Group>

                {/* ACTIONS */}
                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="me-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerCreateServiceRequestScreen;
