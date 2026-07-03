import React, { useState } from "react";
import { Table, Button, Row, Col, Card, Form } from "react-bootstrap";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import Paginate from "../../components/Paginate";

import {
  useGetTechniciansQuery,
  useDeleteTechnicianMutation,
} from "../../slices/technicianApiSlice";

const TechnicianListScreen = () => {
  const navigate = useNavigate();

  /**
   * =========================================================
   * FILTERS
   * =========================================================
   */

  const [page, setPage] = useState(1);

  const [skill, setSkill] = useState("");

  const [availability, setAvailability] = useState("");
  const availabilityHandler = (id) => {
    navigate(`/technicians/${id}/availability`);
  };
  const locationHandler = (id) => {
    navigate(`/technicians/${id}/location`);
  };
  /**
   * =========================================================
   * FETCH TECHNICIANS
   * =========================================================
   */

  const { data, isLoading, error, refetch } = useGetTechniciansQuery({
    page,
    limit: 10,
    skill,
    isAvailable: availability !== "" ? availability : undefined,
  });

  /**
   * =========================================================
   * DELETE
   * =========================================================
   */

  const [deleteTechnician, { isLoading: loadingDelete }] =
    useDeleteTechnicianMutation();

  const deleteHandler = async (technicianId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this technician?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteTechnician(technicianId).unwrap();

      toast.success("Technician deleted successfully");

      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || err?.error || "Failed to delete technician",
      );
    }
  };

  /**
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const viewHandler = (id) => {
    navigate(`/technicians/${id}`);
  };

  const editHandler = (id) => {
    navigate(`/technicians/${id}/edit`);
  };

  /**
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Technicians</h2>
        </Col>

        <Col className="text-end">
          <Button onClick={() => navigate("/technicians/create")}>
            Create Technician
          </Button>
        </Col>
      </Row>

      {/* FILTERS */}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Skill</Form.Label>

                <Form.Select
                  value={skill}
                  onChange={(e) => {
                    setPage(1);

                    setSkill(e.target.value);
                  }}
                >
                  <option value="">All Skills</option>

                  <option value="AC Repair">AC Repair</option>

                  <option value="AC Installation">AC Installation</option>

                  <option value="Heating">Heating</option>

                  <option value="Electrical">Electrical</option>

                  <option value="Maintenance">Maintenance</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Availability</Form.Label>

                <Form.Select
                  value={availability}
                  onChange={(e) => {
                    setPage(1);

                    setAvailability(e.target.value);
                  }}
                >
                  <option value="">All</option>

                  <option value="true">Available</option>

                  <option value="false">Unavailable</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* LOADING */}

      {(isLoading || loadingDelete) && <Loader />}

      {/* ERROR */}

      {error && (
        <Message variant="danger">
          {error?.data?.message || error?.error}
        </Message>
      )}

      {/* TABLE */}

      {!isLoading && !error && (
        <>
          <Card className="shadow-sm">
            <Card.Body>
              <Table striped bordered hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>NAME</th>

                    <th>USER</th>

                    <th>PHONE</th>

                    <th>EMAIL</th>

                    <th>SKILLS</th>

                    <th>AREAS / CITY</th>

                    <th>AVAILABLE</th>

                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {data?.technicians?.map((technician) => (
                    <tr key={technician._id}>
                      <td>{technician.name}</td>

                      <td>{technician?.user?.name}</td>

                      <td>{technician.user?.phone}</td>

                      <td>{technician.email}</td>

                      <td>{technician.skills?.join(", ")}</td>

                      <td>
                        {technician.areas?.map((area) => (
                          <div key={area._id}>
                            <strong>{area.name}</strong>
                            {area.city && (
                              <span className="text-muted">
                                {" "}
                                ({area.city.name})
                              </span>
                            )}
                          </div>
                        ))}
                      </td>

                      <td>
                        {technician.isAvailable ? (
                          <span className="text-success fw-bold">
                            Available
                          </span>
                        ) : (
                          <span className="text-danger fw-bold">
                            Unavailable
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          {/* VIEW */}
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => viewHandler(technician._id)}
                          >
                            <FaEye />
                          </Button>

                          {/* EDIT */}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => editHandler(technician._id)}
                          >
                            <FaEdit />
                          </Button>

                          {/* LOCATION (NEW) */}
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => locationHandler(technician._id)}
                            title="Update Location"
                          >
                            <FaMapMarkerAlt />
                          </Button>

                          {/* AVAILABILITY */}
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => availabilityHandler(technician._id)}
                            title="Update Availability"
                          >
                            <FaToggleOn />
                          </Button>

                          {/* DELETE */}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteHandler(technician._id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* PAGINATION */}

          <div className="mt-4">
            <Paginate
              pages={data?.pages}
              page={data?.page}
              onPageChange={(selectedPage) => setPage(selectedPage)}
            />
          </div>
        </>
      )}
    </>
  );
};

export default TechnicianListScreen;
