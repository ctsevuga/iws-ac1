import React, { useEffect, useState } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import {
  useGetTechnicianDetailsQuery,
  useUpdateTechnicianLocationMutation,
} from "../../slices/technicianApiSlice";

const TechnicianLocationScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * =========================
   * FETCH TECHNICIAN
   * =========================
   */
  const { data: technician, isLoading, error, refetch } =
    useGetTechnicianDetailsQuery(id);

  /**
   * =========================
   * MUTATION
   * =========================
   */
  const [updateLocation, { isLoading: loadingUpdate }] =
    useUpdateTechnicianLocationMutation();

  /**
   * =========================
   * LOCAL STATE
   * =========================
   */
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  /**
   * Populate form when data loads
   */
  useEffect(() => {
    if (technician?.currentLocation) {
      setLat(technician.currentLocation.lat || "");
      setLng(technician.currentLocation.lng || "");
    }
  }, [technician]);

  /**
   * =========================
   * HANDLER
   * =========================
   */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (lat === "" || lng === "") {
      toast.error("Latitude and Longitude are required");
      return;
    }

    try {
      await updateLocation({
        technicianId: id,
        lat: Number(lat),
        lng: Number(lng),
      }).unwrap();

      toast.success("Location updated successfully");
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || err?.error || "Failed to update location"
      );
    }
  };

  /**
   * =========================
   * UI
   * =========================
   */
  return (
    <>
      <Button
        variant="light"
        className="mb-3"
        onClick={() => navigate(-1)}
      >
        Go Back
      </Button>

      <Row>
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h3 className="mb-3">
              Update Technician Location
            </h3>

            {isLoading ? (
              <Loader />
            ) : error ? (
              <Message variant="danger">
                {error?.data?.message || error?.error}
              </Message>
            ) : (
              <Form onSubmit={submitHandler}>
                {/* Technician Info (Read-only context) */}
                <div className="mb-3">
                  <strong>Name:</strong> {technician?.name}
                </div>

                <div className="mb-3">
                  <strong>Phone:</strong> {technician?.phone}
                </div>

                <div className="mb-3">
                  <strong>User:</strong>{" "}
                  {technician?.user?.name}
                </div>

                {/* LAT */}
                <Form.Group className="mb-3">
                  <Form.Label>Latitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Enter latitude"
                  />
                </Form.Group>

                {/* LNG */}
                <Form.Group className="mb-3">
                  <Form.Label>Longitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Enter longitude"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loadingUpdate}
                >
                  {loadingUpdate ? "Updating..." : "Update Location"}
                </Button>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TechnicianLocationScreen;