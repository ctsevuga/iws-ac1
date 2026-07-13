import { useState } from "react";
import { Form, Button, Row, Col, Card, Alert } from "react-bootstrap";

import { useCreateAreaMutation } from "../../slices/areaApiSlice";
import { useGetCityOptionsQuery } from "../../slices/cityApiSlice";

const CreateAreaForm = () => {
  const [createArea, { isLoading }] = useCreateAreaMutation();

  // =========================
  // CITY OPTIONS
  // =========================
  const {
    data: cityOptionsResponse,
    isLoading: citiesLoading,
  } = useGetCityOptionsQuery();

  const cities = cityOptionsResponse?.data || [];

  // =========================
  // STATE
  // =========================
  const [formData, setFormData] = useState({
    city: "",
    name: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // =========================
  // SUBMIT
  // =========================
  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createArea({
        name: formData.name,
        city: formData.city,
      }).unwrap();

      setSuccess("Area created successfully!");

      setFormData({
        city: "",
        name: "",
      });
    } catch (err) {
      setError(err?.data?.message || "Failed to create area");
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3">Create Service Area</h4>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={submitHandler}>
              {/* =========================
                  CITY SELECT (TOP)
              ========================= */}
              <Form.Group className="mb-3">
                <Form.Label>Select City</Form.Label>

                <Form.Select
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      city: e.target.value,
                    }))
                  }
                >
                  <option value="">
                    {citiesLoading ? "Loading..." : "Select City"}
                  </option>

                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* =========================
                  AREA NAME
              ========================= */}
              <Form.Group className="mb-3">
                <Form.Label>Area Name</Form.Label>
                <Form.Control
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      name: e.target.value,
                    }))
                  }
                />
              </Form.Group>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Area"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateAreaForm;