import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import {
  useGetTechnicianDetailsQuery,
  useUpdateTechnicianLocationMutation,
} from "../../slices/technicianApiSlice";

const TechnicianEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * =========================================================
   * FETCH TECHNICIAN
   * =========================================================
   */
  const {
    data: technician,
    isLoading,
    error,
    refetch,
  } = useGetTechnicianDetailsQuery(id);

  /**
   * =========================================================
   * UPDATE LOCATION MUTATION
   * =========================================================
   */
  const [
    updateLocation,
    { isLoading: loadingUpdate },
  ] = useUpdateTechnicianLocationMutation();

  /**
   * =========================================================
   * LOCAL STATE (LOCATION ONLY)
   * =========================================================
   */
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  /**
   * Prefill existing location
   */
  useEffect(() => {
    if (technician?.currentLocation) {
      setLat(
        technician.currentLocation.lat ?? ""
      );
      setLng(
        technician.currentLocation.lng ?? ""
      );
    }
  }, [technician]);

  /**
   * =========================================================
   * ACCESS CONTROL (UI ONLY)
   * =========================================================
   */
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  useEffect(() => {
    if (!userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  /**
   * =========================================================
   * SUBMIT LOCATION UPDATE
   * =========================================================
   */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!lat || !lng) {
      return toast.error(
        "Latitude and Longitude are required"
      );
    }

    try {
      await updateLocation({
        technicianId: id,
        lat: Number(lat),
        lng: Number(lng),
      }).unwrap();

      toast.success(
        "Location updated successfully"
      );

      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update location"
      );
    }
  };

  /**
   * =========================================================
   * NAVIGATION
   * =========================================================
   */
  const backHandler = () => {
    navigate("/technicians");
  };

  return (
    <>
      {/* HEADER */}

      <Row className="mb-4">
        <Col>
          <Button
            variant="light"
            onClick={backHandler}
          >
            ← Back
          </Button>
        </Col>
      </Row>

      {/* LOADING */}

      {isLoading && <Loader />}

      {/* ERROR */}

      {error && (
        <Message variant="danger">
          {error?.data?.message ||
            error?.error}
        </Message>
      )}

      {/* CONTENT */}

      {!isLoading && technician && (
        <Row>
          {/* LEFT SIDE: DETAILS */}

          <Col md={6}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title>
                  Technician Info
                </Card.Title>

                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Name:</strong>{" "}
                    {technician.name}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>Phone:</strong>{" "}
                    {technician.phone}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>Email:</strong>{" "}
                    {technician.email ||
                      "-"}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>User:</strong>{" "}
                    {
                      technician?.user
                        ?.name
                    }{" "}
                    (
                    {
                      technician?.user
                        ?.email
                    }
                    )
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>Status:</strong>{" "}
                    {technician.isAvailable ? (
                      <Badge bg="success">
                        Available
                      </Badge>
                    ) : (
                      <Badge bg="danger">
                        Unavailable
                      </Badge>
                    )}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {/* SKILLS */}

            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>
                  Skills
                </Card.Title>

                {technician.skills?.length ? (
                  <div className="d-flex flex-wrap gap-2">
                    {technician.skills.map(
                      (skill) => (
                        <Badge
                          key={skill}
                          bg="info"
                        >
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>
                ) : (
                  <p>No skills assigned</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT SIDE: LOCATION UPDATE */}

          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>
                  Update Location
                </Card.Title>

                <Form
                  onSubmit={submitHandler}
                >
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Latitude
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) =>
                        setLat(
                          e.target.value
                        )
                      }
                      placeholder="Enter latitude"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Longitude
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) =>
                        setLng(
                          e.target.value
                        )
                      }
                      placeholder="Enter longitude"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      loadingUpdate
                    }
                  >
                    Update Location
                  </Button>

                  {loadingUpdate && (
                    <Loader />
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default TechnicianEditScreen;