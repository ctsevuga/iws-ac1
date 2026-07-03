import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

import { FaUserPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useRegisterCustomerMutation,
  useGetCustomerCityOptionsQuery,
  useGetCustomerAreaOptionsQuery,
} from "../../slices/customerAuthApiSlice";
const validateIndianPhone = (phone) => {
  const original = phone.trim();

  let normalized = original
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  let warning = "";

  // Remove +91
  if (normalized.startsWith("+91")) {
    normalized = normalized.substring(3);
  }
  // Remove 91
  else if (
    normalized.startsWith("91") &&
    normalized.length === 12
  ) {
    normalized = normalized.substring(2);
  }

  // Warn if user entered leading zero(s)
  if (/^0+/.test(normalized)) {
    warning =
      "Leading zero has been removed from the phone number.";
    normalized = normalized.replace(/^0+/, "");
  }

  // Indian mobile number validation
  const isValid = /^[6-9]\d{9}$/.test(normalized);

  return {
    isValid,
    normalized,
    warning,
  };
};
const CustomerRegisterScreen = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "INDIA",
    },
  });

  const { name, phone, email, password, confirmPassword } = formData;

  /**
   * =========================
   * CITY API (TENANT BASED)
   * =========================
   */
  const {
    data: cities = [],
    isLoading: citiesLoading,
    error: cityError,
  } = useGetCustomerCityOptionsQuery(slug);

  /**
   * =========================
   * AREA API (slug + cityId)
   * =========================
   */
  const {
    data: areaResponse,
    isLoading: areasLoading,
    error: areaError,
  } = useGetCustomerAreaOptionsQuery(
    {
      slug,
      cityId: selectedCity,
    },
    {
      skip: !selectedCity,
    },
  );

  const areas = areaResponse?.data || [];

  /**
   * =========================
   * HANDLERS
   * =========================
   */
  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setCityHandler = (e) => {
    const cityId = e.target.value;

    setSelectedCity(cityId);
    setSelectedArea("");

    const city = cities.find((c) => c._id === cityId);

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        city: city ? city.name : "",
      },
    }));
  };

  const addressChangeHandler = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const setAreaHandler = (e) => {
    setSelectedArea(e.target.value);
  };

  const [registerCustomer, { isLoading }] = useRegisterCustomerMutation();

  /**
   * =========================
   * SUBMIT
   * =========================
   */
  const submitHandler = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    return toast.error("Passwords do not match");
  }

  if (!selectedCity) {
    return toast.error("Please select a city");
  }

  const { isValid, normalized, warning } =
    validateIndianPhone(phone);

  if (warning) {
    toast.warning(warning);
  }

  if (!isValid) {
    return toast.error(
      "Please enter a valid Indian mobile number."
    );
  }

  try {
    await registerCustomer({
      slug,
      data: {
        name,
        phone: normalized,
        email,
        password,
        city: selectedCity,
        area: selectedArea,
        address: formData.address,
      },
    }).unwrap();

    toast.success("Registration successful");
    navigate(`/${slug}`);
  } catch (err) {
    toast.error(
      err?.data?.message || "Registration failed"
    );
  }
};

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3 className="mb-0">
                <FaUserPlus className="me-2" />
                Customer Registration
              </h3>
            </Card.Header>

            <Card.Body className="p-4">
              {cityError && (
                <Alert variant="danger">Failed to load cities</Alert>
              )}

              <Form onSubmit={submitHandler}>
                {/* NAME */}
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={name}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                {/* PHONE */}
                <Form.Group className="mb-3">
  <Form.Label>Phone</Form.Label>
  <Form.Control
    type="tel"
    name="phone"
    value={phone}
    onChange={changeHandler}
    placeholder="9876543210"
    maxLength={13}
    required
  />
  <Form.Text className="text-muted">
    Enter a valid 10-digit Indian mobile number.
  </Form.Text>
</Form.Group>
                {/* EMAIL */}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={changeHandler}
                    placeholder="Enter your email"
                  />
                </Form.Group>
                {/* STREET */}
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    name="street"
                    value={formData.address.street}
                    onChange={addressChangeHandler}
                    placeholder="Street / Building / House No."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        name="state"
                        value={formData.address.state}
                        onChange={addressChangeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pincode</Form.Label>
                      <Form.Control
                        name="pincode"
                        value={formData.address.pincode}
                        onChange={addressChangeHandler}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    name="country"
                    value={formData.address.country}
                    onChange={addressChangeHandler}
                  />
                </Form.Group>
                {/* CITY */}
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Select value={selectedCity} onChange={setCityHandler}>
                    <option value="">
                      {citiesLoading ? "Loading..." : "Select City"}
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
                    value={selectedArea}
                    onChange={setAreaHandler}
                    disabled={!selectedCity}
                  >
                    <option value="">
                      {!selectedCity
                        ? "Select city first"
                        : areasLoading
                          ? "Loading..."
                          : "Select Area"}
                    </option>

                    {areas.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* PASSWORD */}
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="me-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerRegisterScreen;
