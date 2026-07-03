import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  useGetAreaDetailsQuery,
  useGetCompanyCitiesQuery,
  useUpdateAreaMutation,
} from "../../slices/areaApiSlice";

const UpdateArea = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // AREA DETAILS
  // =========================
  const {
    data: area,
    isLoading,
    isError,
  } = useGetAreaDetailsQuery(id);

  // =========================
  // COMPANY CITIES (NEW MODEL)
  // =========================
  const {
    data: cityData,
    isLoading: citiesLoading,
  } = useGetCompanyCitiesQuery();

  const cities = Array.isArray(cityData)
    ? cityData
    : cityData?.data || [];

  const [updateArea, { isLoading: updating }] =
    useUpdateAreaMutation();

  // =========================
  // FORM STATE (UPDATED)
  // =========================
  const [formData, setFormData] = useState({
    name: "",
    city: "",
  });

  const [error, setError] = useState("");

  // =========================
  // PREFILL DATA
  // =========================
  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name || "",
        city: area.city?._id || "",
      });
    }
  }, [area]);

  // =========================
  // SUBMIT UPDATE
  // =========================
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await updateArea({
        areaId: id,
        name: formData.name,
        city: formData.city,
      }).unwrap();

      navigate(`/areas/${id}`);
    } catch (err) {
      setError(err?.data?.message || "Failed to update area");
    }
  };

  // =========================
  // LOADING
  // =========================
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (isError || !area) {
    return (
      <Alert variant="danger">
        Failed to load area
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-3">Update Area</h4>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        <Form onSubmit={submitHandler}>

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

          {/* =========================
              CITY SELECT (UPDATED MODEL)
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
              ACTIONS
          ========================= */}
          <div className="d-flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Area"}
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
  );
};

export default UpdateArea;