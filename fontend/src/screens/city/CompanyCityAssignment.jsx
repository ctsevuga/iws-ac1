import { useState } from "react";
import {
  Form,
  Button,
  Card,
  Alert,
  Row,
  Col,
  ListGroup,
} from "react-bootstrap";

import {
  useCreateCityMutation,
  useGetCitiesQuery,
} from "../../slices/cityApiSlice";

import { useGetCityMasterOptionsQuery } from "../../slices/cityMasterApiSlice";

const CompanyCityAssignment = () => {
  const [createCity, { isLoading }] = useCreateCityMutation();

  /*
   * Already assigned company cities
   */
  const {
    data: assignedResponse,
    isLoading: assignedLoading,
    refetch,
  } = useGetCitiesQuery();

  const assignedCities = assignedResponse?.data || [];

  /*
   * Master cities available for assignment
   */
  const { data: cityMasters = [], isLoading: citiesLoading } =
    useGetCityMasterOptionsQuery();

  const [city, setCity] = useState("");

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(null);

  /*
   * Remove already assigned cities
   */
  const availableCities = cityMasters.filter(
    (masterCity) =>
      !assignedCities.some(
        (assigned) => assigned.cityMaster === masterCity._id,
      ),
  );

  const selectedCity = cityMasters.find((c) => c._id === city);

  const submitHandler = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    try {
      if (!selectedCity) {
        setError("Please select a city");

        return;
      }

      await createCity({
        // Reference to CityMaster
        cityMaster: selectedCity._id,

        name: selectedCity.name,

        state: selectedCity.state,

        country: selectedCity.country,
      }).unwrap();

      setSuccess("City assigned successfully!");

      setCity("");

      // Refresh company assigned cities
      refetch();
    } catch (err) {
      setError(err?.data?.message || "Failed to assign city");
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3">Assign Service City</h4>

            {error && <Alert variant="danger">{error}</Alert>}

            {success && <Alert variant="success">{success}</Alert>}

            {/* Assigned Cities */}

            <Card className="mb-4">
              <Card.Header>Assigned Cities</Card.Header>

              <Card.Body>
                {assignedLoading ? (
                  <p>Loading assigned cities...</p>
                ) : assignedCities.length === 0 ? (
                  <p className="text-muted">No cities assigned yet.</p>
                ) : (
                  <ListGroup>
                    {assignedCities.map((city) => (
                      <ListGroup.Item key={city._id}>
                        <strong>{city.name}</strong>

                        {" - "}

                        {city.state}

                        {city.country && ` (${city.country})`}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>

            {/* Add New City */}

            <Form onSubmit={submitHandler}>
              <Form.Group className="mb-3">
                <Form.Label>Add New City *</Form.Label>

                <Form.Select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={citiesLoading || availableCities.length === 0}
                  required
                >
                  <option value="">
                    {citiesLoading
                      ? "Loading cities..."
                      : availableCities.length === 0
                        ? "No new cities available"
                        : "Select City"}
                  </option>

                  {availableCities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {selectedCity && (
                <Card className="bg-light mb-3">
                  <Card.Body>
                    <Row>
                      <Col>
                        <strong>State:</strong> {selectedCity.state}
                      </Col>

                      <Col>
                        <strong>Country:</strong> {selectedCity.country}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <Button type="submit" disabled={isLoading || !city}>
                {isLoading ? "Assigning..." : "Assign City"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CompanyCityAssignment;
