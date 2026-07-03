import React from "react";
import {
  Container,
  Card,
  Spinner,
  Button,
  Badge,
  Row,
  Col,
} from "react-bootstrap";

import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetAnnouncementByIdQuery,
  useDeleteAnnouncementMutation,
} from "../../slices/customerPortalApiSlice";

const ViewAnnouncementScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: announcement,
    isLoading,
    error,
  } = useGetAnnouncementByIdQuery(id);

  const [deleteAnnouncement, { isLoading: deleting }] =
    useDeleteAnnouncementMutation();

  // ===============================
  // DELETE HANDLER
  // ===============================
  const deleteHandler = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmDelete) return;

    try {
      await deleteAnnouncement(id).unwrap();

      toast.success("Announcement deleted successfully");

      navigate("/admin/announcements");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete announcement");
    }
  };

  // ===============================
  // LOADING
  // ===============================
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  // ===============================
  // ERROR
  // ===============================
  if (error) {
    toast.error(error?.data?.message || "Failed to load announcement");

    return (
      <Container className="py-5">
        <Card className="p-4 text-danger">
          Failed to load announcement
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* BACK BUTTON */}
      <Row className="mb-3">
        <Col>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {/* TITLE + STATUS */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h3 className="fw-bold mb-0">
              {announcement?.title}
            </h3>

            {announcement?.active ? (
              <Badge bg="success">Active</Badge>
            ) : (
              <Badge bg="secondary">Inactive</Badge>
            )}
          </div>

          {/* MESSAGE */}
          <Card className="bg-light border-0 mb-4">
            <Card.Body>
              <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
                {announcement?.message}
              </p>
            </Card.Body>
          </Card>

          {/* DATES */}
          <Row className="mb-4">
            <Col md={6}>
              <strong>Start Date:</strong>
              <div>
                {announcement?.startDate
                  ? new Date(announcement.startDate).toLocaleString()
                  : "Not set"}
              </div>
            </Col>

            <Col md={6}>
              <strong>End Date:</strong>
              <div>
                {announcement?.endDate
                  ? new Date(announcement.endDate).toLocaleString()
                  : "Not set"}
              </div>
            </Col>
          </Row>

          {/* ACTION BUTTONS */}
          <div className="d-flex gap-2">
            <Button
              variant="danger"
              onClick={deleteHandler}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                "Delete Announcement"
              )}
            </Button>

            <Button
              variant="outline-primary"
              onClick={() =>
                navigate(`/admin/announcements/${id}/edit`)
              }
            >
              Edit
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ViewAnnouncementScreen;