import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useAddAnnouncementMutation,
} from "../../slices/customerPortalApiSlice";

const AddAnnouncementScreen = () => {
  const navigate = useNavigate();

  const [addAnnouncement, { isLoading }] =
    useAddAnnouncementMutation();

  // ===============================
  // Form state
  // ===============================
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ===============================
  // Submit Handler
  // ===============================
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!title.trim())
      return toast.error("Title is required");

    if (!message.trim())
      return toast.error("Message is required");

    try {
      await addAnnouncement({
        title,
        message,
        startDate,
        endDate,
      }).unwrap();

      toast.success("Announcement added successfully");

      navigate("/announcementList");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add announcement");
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="mb-4 fw-bold">
                Add Announcement
              </h3>

              <Form onSubmit={submitHandler}>
                {/* TITLE */}
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Enter announcement title"
                  />
                </Form.Group>

                {/* MESSAGE */}
                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    placeholder="Enter announcement message"
                  />
                </Form.Group>

                <Row>
                  {/* START DATE */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                          setStartDate(e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  {/* END DATE */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                          setEndDate(e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* BUTTONS */}
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      "Add Announcement"
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() =>
                      navigate("/admin/announcements")
                    }
                  >
                    Cancel
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

export default AddAnnouncementScreen;