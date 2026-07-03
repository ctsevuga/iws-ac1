import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import { useCreateTechnicianMutation } from "../../slices/technicianApiSlice";
import { useGetTechnicianUserOptionsQuery } from "../../slices/usersApiSlice";
import { useGetAreasQuery } from "../../slices/areaApiSlice";
import { useGetCityOptionsQuery } from "../../slices/cityApiSlice";

const TechnicianCreateScreen = () => {
  const navigate = useNavigate();

  /**
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [user, setUser] = useState("");

  const [skills, setSkills] = useState([]);

  const [areas, setAreas] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");

  const [isAvailable, setIsAvailable] = useState(true);

  const [lat, setLat] = useState("");

  const [lng, setLng] = useState("");

  /**
   * =========================================================
   * API
   * =========================================================
   */

  const [createTechnician, { isLoading: loadingCreate, error: createError }] =
    useCreateTechnicianMutation();

  /**
   * Technician Users
   */

  const {
    data: technicianUsers = [],
    isLoading: loadingUsers,
    error: usersError,
  } = useGetTechnicianUserOptionsQuery();

  /**
   * Cities
   */

  const {
    data: cityOptionsResponse,
    isLoading: loadingCities,
    error: citiesError,
  } = useGetCityOptionsQuery();

  const cities = cityOptionsResponse?.data || [];


  /**
   * Areas
   */

  const {
    data: areasData,
    isLoading: loadingAreas,
    error: areasError,
  } = useGetAreasQuery();
    /**
   * =========================================================
   * SELECTED USER
   * =========================================================
   */

  const selectedUser = technicianUsers.find((u) => u._id === user);

  /**
   * =========================================================
   * FILTER AREAS BY CITY
   * =========================================================
   */

  const filteredAreas =
    areasData?.areas?.filter(
      (area) => area.city?._id === selectedCity || area.city === selectedCity,
    ) || [];

  /**
   * =========================================================
   * ACCESS CONTROL
   * =========================================================
   */

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    if (!userInfo || !["manager", "dispatcher"].includes(userInfo.role)) {
      toast.error("Not authorized");
      navigate("/");
    }
  }, [navigate, userInfo]);

  /**
   * =========================================================
   * SKILLS
   * =========================================================
   */

  const availableSkills = [
    "AC Repair",
    "AC Installation",
    "Heating",
    "Electrical",
    "Maintenance",
  ];

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  /**
   * =========================================================
   * CITY
   * =========================================================
   */

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);

    // reset selected areas when city changes
    setAreas([]);
  };

  /**
   * =========================================================
   * AREAS
   * =========================================================
   */

  const toggleArea = (areaId) => {
    if (areas.includes(areaId)) {
      setAreas(areas.filter((a) => a !== areaId));
    } else {
      setAreas([...areas, areaId]);
    }
  };

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!user) {
      return toast.error("Please select technician user");
    }

    if (!selectedCity) {
      return toast.error("Please select a city");
    }

    if (areas.length === 0) {
      return toast.error("Please select at least one service area");
    }

    try {
      await createTechnician({
        user,
        skills,
        isAvailable,
        currentLocation: {
          lat: lat !== "" ? Number(lat) : undefined,
          lng: lng !== "" ? Number(lng) : undefined,
        },
        areas,
      }).unwrap();

      toast.success("Technician created successfully");

      navigate("/technicians");
    } catch (err) {
      toast.error(
        err?.data?.message || err?.error || "Failed to create technician",
      );
    }
  };

  return (
    <Row className="justify-content-md-center">
      <Col md={10} lg={8}>
        <Card className="shadow-sm">
          <Card.Body>
            <h2 className="mb-4">Create Technician</h2>

            {createError && (
              <Message variant="danger">{createError?.data?.message}</Message>
            )}

            {usersError && (
              <Message variant="danger">
                {usersError?.data?.message || "Failed to load technician users"}
              </Message>
            )}

            {citiesError && (
              <Message variant="danger">
                {citiesError?.data?.message || "Failed to load cities"}
              </Message>
            )}

            {areasError && (
              <Message variant="danger">
                {areasError?.data?.message || "Failed to load service areas"}
              </Message>
            )}

            {(loadingUsers || loadingCities || loadingAreas) && <Loader />}

            <Form onSubmit={submitHandler}>
              {/* USER */}
              <Form.Group className="mb-3" controlId="user">
                <Form.Label>Technician User</Form.Label>

                <Form.Select
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required
                >
                  <option value="">Select Technician User</option>

                  {technicianUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* USER DETAILS */}
              {selectedUser && (
                <Card className="mb-4 border-0 bg-light">
                  <Card.Body>
                    <h6 className="mb-3">Selected User Information</h6>

                    <Row>
                      <Col md={4}>
                        <strong>Name</strong>
                        <div>{selectedUser.name || "-"}</div>
                      </Col>

                      <Col md={4}>
                        <strong>Email</strong>
                        <div>{selectedUser.email || "-"}</div>
                      </Col>

                      <Col md={4}>
                        <strong>Phone</strong>
                        <div>{selectedUser.phone || "-"}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* SKILLS */}
              <Form.Group className="mb-4">
                <Form.Label>Skills</Form.Label>

                <div className="d-flex flex-wrap gap-3">
                  {availableSkills.map((skill) => (
                    <Form.Check
                      key={skill}
                      type="checkbox"
                      label={skill}
                      checked={skills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                  ))}
                </div>
              </Form.Group>

              {/* CITY */}
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>

                <Form.Select value={selectedCity} onChange={handleCityChange}>
                  <option value="">Select City</option>

                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* AREAS */}
              {selectedCity && (
                <Form.Group className="mb-4">
                  <Form.Label>Service Areas</Form.Label>

                  <div
  className="border rounded p-3"
  style={{
    maxHeight: "420px",
    overflowY: "auto",
  }}
>
  <Row xs={1} md={3}>
    {filteredAreas.map((area) => (
      <Col key={area._id} className="mb-2">
        <Form.Check
          type="checkbox"
          id={`area-${area._id}`}
          label={area.name}
          checked={areas.includes(area._id)}
          onChange={() => toggleArea(area._id)}
        />
      </Col>
    ))}
  </Row>
</div>

                  {filteredAreas.length === 0 && (
                    <small className="text-muted">
                      No service areas found for the selected city
                    </small>
                  )}
                </Form.Group>
              )}

              {/* AVAILABILITY */}
              <Form.Group className="mb-4" controlId="availability">
                <Form.Check
                  type="switch"
                  label="Available"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
              </Form.Group>

              {/* LOCATION */}

              {/* SUBMIT */}
              <Button
                type="submit"
                variant="primary"
                className="mt-3"
                disabled={loadingCreate}
              >
                Create Technician
              </Button>

              {loadingCreate && <Loader />}
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TechnicianCreateScreen;
