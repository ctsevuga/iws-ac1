import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Card,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";

import {
  useGetCityDetailsQuery,
  useUpdateCityMutation,
} from "../../slices/cityApiSlice";

const UpdateCity = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------------------------------------------------------------------- */
  /*                              FETCH CITY                                */
  /* ---------------------------------------------------------------------- */

  const {
    data: cityResponse,
    isLoading,
    isError,
  } = useGetCityDetailsQuery(id);

  const city = cityResponse?.data;

  /* ---------------------------------------------------------------------- */
  /*                              UPDATE CITY                               */
  /* ---------------------------------------------------------------------- */

  const [updateCity, { isLoading: updating }] =
    useUpdateCityMutation();

  /* ---------------------------------------------------------------------- */
  /*                              FORM STATE                                */
  /* ---------------------------------------------------------------------- */

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------------------------------------------------------------- */
  /*                              PREFILL                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name || "",
        state: city.state || "",
        country: city.country || "",
      });
    }
  }, [city]);

  /* ---------------------------------------------------------------------- */
  /*                              SUBMIT                                    */
  /* ---------------------------------------------------------------------- */

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateCity({
        cityId: id,
        name: formData.name,
        state: formData.state,
        country: formData.country,
      }).unwrap();

      setSuccess("City updated successfully!");

      setTimeout(() => {
        navigate(`/cities/${id}`);
      }, 800);
    } catch (err) {
      setError(err?.data?.message || "Failed to update city");
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              LOADING                                   */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                              ERROR                                     */
  /* ---------------------------------------------------------------------- */

  if (isError || !city) {
    return (
      <Alert variant="danger">
        City not found or failed to load
      </Alert>
    );
  }

  /* ---------------------------------------------------------------------- */

  return (
    <Row className="justify-content-center">
      <Col md={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3">Update City</h4>

            {error && (
              <Alert variant="danger">{error}</Alert>
            )}

            {success && (
              <Alert variant="success">{success}</Alert>
            )}

            <Form onSubmit={submitHandler}>
              {/* NAME */}
              <Form.Group className="mb-3">
                <Form.Label>City Name</Form.Label>
                <Form.Control
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </Form.Group>

              {/* STATE */}
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      state: e.target.value,
                    }))
                  }
                />
              </Form.Group>

              {/* COUNTRY */}
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  value={formData.country}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      country: e.target.value,
                    }))
                  }
                />
              </Form.Group>

              {/* ACTIONS */}
              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  disabled={updating}
                >
                  {updating
                    ? "Updating..."
                    : "Update City"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default UpdateCity;