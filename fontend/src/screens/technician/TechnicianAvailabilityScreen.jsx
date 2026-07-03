import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import {
  useGetTechnicianDetailsQuery,
  useUpdateTechnicianAvailabilityMutation,
} from "../../slices/technicianApiSlice";

const TechnicianAvailabilityScreen = () => {
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
   * MUTATION
   * =========================================================
   */
  const [
    updateAvailability,
    { isLoading: loadingUpdate },
  ] = useUpdateTechnicianAvailabilityMutation();

  /**
   * =========================================================
   * LOCAL STATE
   * =========================================================
   */
  const [isAvailable, setIsAvailable] =
    useState(false);

  /**
   * Prefill availability
   */
  useEffect(() => {
    if (technician) {
      setIsAvailable(
        technician.isAvailable
      );
    }
  }, [technician]);

  /**
   * =========================================================
   * ACCESS CONTROL (UI ONLY)
   * =========================================================
   *
   * Real enforcement is in backend:
   * - manager / dispatcher → full access
   * - technician → self update only
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
   * SUBMIT HANDLER
   * =========================================================
   */
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateAvailability({
        technicianId: id,
        isAvailable,
      }).unwrap();

      toast.success(
        "Availability updated successfully"
      );

      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update availability"
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

  /**
   * =========================================================
   * UI
   * =========================================================
   */
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
          {/* LEFT SIDE INFO */}

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
                    <strong>User:</strong>{" "}
                    {
                      technician?.user
                        ?.name
                    }
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
          </Col>

          {/* RIGHT SIDE FORM */}

          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>
                  Update Availability
                </Card.Title>

                <Form onSubmit={submitHandler}>
                  <Form.Group
                    className="mb-3"
                    controlId="availability"
                  >
                    <Form.Check
                      type="switch"
                      label={
                        isAvailable
                          ? "Available"
                          : "Unavailable"
                      }
                      checked={isAvailable}
                      onChange={(e) =>
                        setIsAvailable(
                          e.target.checked
                        )
                      }
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      loadingUpdate
                    }
                  >
                    Update Status
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

export default TechnicianAvailabilityScreen;