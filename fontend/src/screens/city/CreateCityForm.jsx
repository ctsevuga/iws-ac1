import { useState } from "react";
import { Form, Button, Card, Alert, Row, Col } from "react-bootstrap";
import { useCreateCityMutation } from "../../slices/cityApiSlice";

const CreateCityForm = () => {
  const [createCity, { isLoading }] = useCreateCityMutation();

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "India",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ---------------------------------------------------------------------- */
  /*                              SUBMIT HANDLER                            */
  /* ---------------------------------------------------------------------- */

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createCity({
        name: formData.name,
        state: formData.state,
        country: formData.country,
      }).unwrap();

      setSuccess("City created successfully!");

      setFormData({
        name: "",
        state: "",
        country: "India",
      });
    } catch (err) {
      setError(err?.data?.message || "Failed to create city");
    }
  };

  /* ---------------------------------------------------------------------- */

  return (
    <Row className="justify-content-center">
      <Col md={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3">Create City</h4>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={submitHandler}>
              {/* CITY NAME */}
              <Form.Group className="mb-3">
                <Form.Label>City Name *</Form.Label>
                <Form.Control
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter city name"
                  required
                />
              </Form.Group>

              {/* STATE */}
              <Form.Group className="mb-3">
                <Form.Label>State (optional)</Form.Label>
                <Form.Control
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  placeholder="Enter state"
                />
              </Form.Group>

              {/* COUNTRY */}
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  value={formData.country}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      country: e.target.value,
                    }))
                  }
                  placeholder="Enter country"
                />
                <small className="text-muted">
                  Defaults to "India" if left unchanged
                </small>
              </Form.Group>

              {/* SUBMIT */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create City"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateCityForm;