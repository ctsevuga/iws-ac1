import React, { useState } from "react";
import { Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCreateCustomerMutation } from "../../slices/customerApiSlice";
import { useGetAreaOptionsQuery } from "../../slices/areaApiSlice";
import { useGetCityOptionsQuery } from "../../slices/cityApiSlice";

const CustomerCreateScreen = () => {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [area, setArea] = useState("");

  const [selectedCity, setSelectedCity] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("USA");

  // =========================
  // API
  // =========================
  const [createCustomer, { isLoading, error }] = useCreateCustomerMutation();

  const {
    data: areasResponse,
    isLoading: areasLoading,
    error: areasError,
  } = useGetAreaOptionsQuery();

  const {
    data: cityResponse,
    isLoading: citiesLoading,
    error: citiesError,
  } = useGetCityOptionsQuery();

  // =========================
  // SAFE DATA NORMALIZATION
  // =========================

  const areas = Array.isArray(areasResponse)
    ? areasResponse
    : areasResponse?.areas || areasResponse?.data || [];

  const cities = Array.isArray(cityResponse)
    ? cityResponse
    : cityResponse?.data || cityResponse?.cities || [];

  // =========================
  // FILTER AREAS BY CITY
  // =========================
  const filteredAreas = selectedCity
    ? areas.filter(
        (a) => a.city?._id === selectedCity || a.city === selectedCity,
      )
    : [];
  const validateIndianPhone = (phone) => {
    const original = phone.trim();

    let normalized = original.replace(/\s+/g, "").replace(/-/g, "");

    let warning = "";

    if (normalized.startsWith("+91")) {
      normalized = normalized.substring(3);
    } else if (normalized.startsWith("91") && normalized.length === 12) {
      normalized = normalized.substring(2);
    }

    if (normalized.startsWith("0")) {
      warning = "Leading 0 has been removed from the phone number.";
      normalized = normalized.replace(/^0+/, "");
    }

    const isValid = /^[6-9]\d{9}$/.test(normalized);

    return {
      isValid,
      normalized,
      warning,
    };
  };
  // =========================
  // SUBMIT
  // =========================
  const submitHandler = async (e) => {
    e.preventDefault();
    const { isValid, normalized, warning } = validateIndianPhone(phone);

    if (warning) {
      toast.warning(warning);
    }

    if (!isValid) {
      toast.error("Please enter a valid Indian mobile number.");
      return;
    }
    try {
      const payload = {
        name,
        phone: normalized,
        email,
        notes,
        area: area || undefined,
        address: {
          street: street || undefined,
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          country: country || "USA",
        },
      };

      const res = await createCustomer(payload).unwrap();

      toast.success("Customer created successfully");
      navigate(`/customers/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create customer");
    }
  };

  return (
    <Row className="justify-content-center my-4">
      <Col md={10} lg={8}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h2>Create Customer</h2>

            {/* ERRORS */}
            {error && (
              <Alert variant="danger">
                {error?.data?.message || error?.error}
              </Alert>
            )}

            {citiesError && (
              <Alert variant="danger">Failed to load cities</Alert>
            )}

            {areasError && <Alert variant="danger">Failed to load areas</Alert>}

            <Form onSubmit={submitHandler}>
              {/* BASIC INFO */}
              <Card className="mb-3">
                <Card.Header>Basic Info</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* CITY + AREA */}
              <Card className="mb-3">
                <Card.Header>Service Location</Card.Header>
                <Card.Body>
                  {/* CITY */}
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>

                    <Form.Select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setArea("");
                      }}
                      disabled={citiesLoading}
                    >
                      <option value="">
                        {citiesLoading ? "Loading cities..." : "Select City"}
                      </option>

                      {cities.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* AREA */}
                  <Form.Group className="mb-3">
                    <Form.Label>Area</Form.Label>

                    <Form.Select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      disabled={!selectedCity}
                    >
                      <option value="">
                        {!selectedCity ? "Select city first" : "Select Area"}
                      </option>

                      {filteredAreas.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* ADDRESS */}
              <Card className="mb-3">
                <Card.Header>Address</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Street</Form.Label>
                        <Form.Control
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Pincode</Form.Label>
                        <Form.Control
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* NOTES */}
              <Card className="mb-3">
                <Card.Header>Extra Info</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* ACTIONS */}
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Customer"
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CustomerCreateScreen;
