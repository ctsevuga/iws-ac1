import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  ListGroup,
} from "react-bootstrap";

import { useCreateAreaMutation } from "../../slices/areaApiSlice";

import {
  useGetCitiesQuery,
  } from "../../slices/cityApiSlice";

import {
   useGetCityAreasQuery,
} from "../../slices/areaApiSlice";

import { useGetCityAreaMastersQuery } from "../../slices/areaMasterApiSlice";

const CompanyAreaAssignment = () => {
  const [createArea, { isLoading }] = useCreateAreaMutation();

  /*
   * Company assigned cities
   */
  const { data: cityResponse, isLoading: citiesLoading } = useGetCitiesQuery();

  const cities = cityResponse?.data || [];
  

  const [formData, setFormData] = useState({
  city: "",        // Company City ID
  cityMaster: "",  // CityMaster ID
  area: "",
});

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(null);

  /*
   * Existing company assigned areas
   * for selected city
   */

  const {
    data: assignedAreaResponse,
    isLoading: assignedAreasLoading,
    refetch: refetchAssignedAreas,
  } = useGetCityAreasQuery(formData.city, {
    skip: !formData.city,
  });

  const assignedAreas = assignedAreaResponse?.areas || [];

  /*
   * Area master list
   * for selected city
   */

  const {
  data: areaMasters = [],
  isLoading: areaMastersLoading
} =
useGetCityAreaMastersQuery(
  formData.cityMaster,
  {
    skip: !formData.cityMaster,
  }
);


  /*
   * Remove already assigned areas
   */

  const availableAreas = areaMasters.filter(
    (masterArea) =>
      !assignedAreas.some(
        (assignedArea) => assignedArea.name === masterArea.name,
      ),
  );
  

  /*
   * Reset area when city changes
   */

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      area: "",
    }));
  }, [formData.city]);

  /*
   * Submit
   */


  const submitHandler = async (e) => {
    e.preventDefault();

    setError(null);

    setSuccess(null);

    try {
      const selectedArea = areaMasters.find((a) => a._id === formData.area);

      if (!selectedArea) {
        setError("Please select an area");

        return;
      }
      console.log("Submitting:", {
  name: selectedArea.name,
  city: formData.city,
  areaMaster: formData.area,
});
      await createArea({
  name: selectedArea.name,
  city: formData.city,
  areaMaster: formData.area,
}).unwrap();

      setSuccess("Area assigned successfully!");

      setFormData({
        city: "",
        area: "",
      });

      refetchAssignedAreas();
    } catch (err) {
      setError(err?.data?.message || "Failed to assign area");
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3">Assign Service Area</h4>

            {error && <Alert variant="danger">{error}</Alert>}

            {success && <Alert variant="success">{success}</Alert>}

            {/* CITY */}

            <Form.Group className="mb-3">
              <Form.Label>Select City</Form.Label>

              <Form.Select
                value={formData.city}
                onChange={(e) => {

  const selectedCity = cities.find(
    (city) => city._id === e.target.value
  );


  setFormData((prev) => ({
    ...prev,

    city: selectedCity._id,

    cityMaster: selectedCity.cityMaster,

    area: "",
  }));

}}
                disabled={citiesLoading}
                required
              >
                <option value="">
                  {citiesLoading ? "Loading cities..." : "Select City"}
                </option>

                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* EXISTING AREAS */}

            {formData.city && (
              <Card className="mb-3">
                <Card.Header>Assigned Areas</Card.Header>

                <Card.Body>
                  {assignedAreasLoading ? (
                    <p>Loading assigned areas...</p>
                  ) : assignedAreas.length === 0 ? (
                    <p className="text-muted">
                      No areas assigned for this city.
                    </p>
                  ) : (
                    <ListGroup>
                      {assignedAreas.map((area) => (
                        <ListGroup.Item key={area._id}>
                          {area.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* ADD AREA */}

            <Form onSubmit={submitHandler}>
              <Form.Group className="mb-3">
                <Form.Label>Add New Area</Form.Label>

                <Form.Select
                  value={formData.area}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      area: e.target.value,
                    }))
                  }
                  disabled={
                    !formData.city ||
                    areaMastersLoading ||
                    availableAreas.length === 0
                  }
                  required
                >
                  <option value="">
                    {areaMastersLoading
                      ? "Loading areas..."
                      : availableAreas.length === 0
                        ? "No new areas available"
                        : "Select Area"}
                  </option>

                  {availableAreas.map((area) => (
                    <option key={area._id} value={area._id}>
                      {area.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Button
                type="submit"
                disabled={isLoading || !formData.city || !formData.area}
              >
                {isLoading ? "Assigning..." : "Assign Area"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CompanyAreaAssignment;
