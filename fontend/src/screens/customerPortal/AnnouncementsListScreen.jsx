import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
  Badge,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetPortalAnnouncementsQuery,
  useDeleteAnnouncementMutation,
} from "../../slices/customerPortalApiSlice";

const AnnouncementsListScreen = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetPortalAnnouncementsQuery();

  const [deleteAnnouncement, { isLoading: deleteLoading }] =
    useDeleteAnnouncementMutation();

  // ===============================
  // Delete Handler
  // ===============================
  const deleteHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;

    try {
      await deleteAnnouncement(id).unwrap();
      toast.success("Announcement deleted");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  // ===============================
  // Loading State
  // ===============================
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  // ===============================
  // Error State
  // ===============================
  if (error) {
    return (
      <Container className="py-5">
        <Card className="p-3 text-danger">
          Failed to load announcements
        </Card>
      </Container>
    );
  }

  const announcements = data?.announcements || [];

  return (
    <Container className="py-4">
      {/* ================= HEADER ================= */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h3 className="fw-bold">Announcements</h3>
        </Col>

        <Col className="text-end">
          <Button
            variant="primary"
            onClick={() =>
              navigate("/announcements/add")
            }
          >
            + Add Announcement
          </Button>
        </Col>
      </Row>

      {/* ================= TABLE ================= */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          {announcements.length === 0 ? (
            <p className="text-muted mb-0">
              No announcements found
            </p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {announcements.map((a) => (
                  <tr key={a._id}>
                    {/* TITLE */}
                    <td className="fw-semibold">
                      {a.title}
                    </td>

                    {/* STATUS */}
                    <td>
                      {a.active ? (
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="secondary">Inactive</Badge>
                      )}
                    </td>

                    {/* START DATE */}
                    <td>
                      {a.startDate
                        ? new Date(
                            a.startDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* END DATE */}
                    <td>
                      {a.endDate
                        ? new Date(
                            a.endDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ACTIONS */}
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="info"
                        className="me-2"
                        onClick={() =>
                          navigate(
                            `/announcements/${a._id}`
                          )
                        }
                      >
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          deleteHandler(a._id)
                        }
                        disabled={deleteLoading}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AnnouncementsListScreen;