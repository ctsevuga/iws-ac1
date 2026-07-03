import React, { useEffect, useState } from "react";

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

import {
  FaBuilding,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
  useGetMyCompanyQuery,
  useUpdateMyCompanyMutation,
} from "../../slices/companyApiSlice";

const StaffCompanyEditScreen = () => {
  const navigate = useNavigate();

  const { data: company, isLoading, error } = useGetMyCompanyQuery();
  const [updateMyCompany, { isLoading: updating }] =
    useUpdateMyCompanyMutation();

  // =========================
  // LOCAL FORM STATE
  // =========================
  const [formData, setFormData] = useState({
    name: "",
    legalName: "",
    email: "",
    phone: "",
    website: "",
    slug: "",
    domain: "",
    timezone: "",
    currency: "",
    logoUrl: "",

    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    },

    brand: {
      primaryColor: "",
      secondaryColor: "",
      faviconUrl: "",
    },

    settings: {
      allowOnlineBooking: false,
      autoAssignTechnician: false,
      enableInvoicing: false,
      enablePayments: false,
      defaultJobDurationMinutes: 60,
    },
  });

  // =========================
  // LOAD DATA INTO FORM
  // =========================
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        legalName: company.legalName || "",
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        slug: company.slug || "",
        domain: company.domain || "",
        timezone: company.timezone || "",
        currency: company.currency || "",
        logoUrl: company.logoUrl || "",

        address: {
          street: company.address?.street || "",
          city: company.address?.city || "",
          state: company.address?.state || "",
          pincode: company.address?.pincode || "",
          country: company.address?.country || "",
        },

        brand: {
          primaryColor: company.brand?.primaryColor || "",
          secondaryColor: company.brand?.secondaryColor || "",
          faviconUrl: company.brand?.faviconUrl || "",
        },

        settings: {
          allowOnlineBooking:
            company.settings?.allowOnlineBooking || false,
          autoAssignTechnician:
            company.settings?.autoAssignTechnician || false,
          enableInvoicing: company.settings?.enableInvoicing || false,
          enablePayments: company.settings?.enablePayments || false,
          defaultJobDurationMinutes:
            company.settings?.defaultJobDurationMinutes || 60,
        },
      });
    }
  }, [company]);

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleBrandChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        [name]: value,
      },
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, checked, type, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateMyCompany(formData).unwrap();
      alert("Company updated successfully");
      navigate("/company"); // or "/my-company"
    } catch (err) {
      alert(err?.data?.message || "Update failed");
    }
  };

  // =========================
  // UI
  // =========================
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error?.data?.message || "Failed to load company"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">

      {/* HEADER */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="fw-bold text-primary">
            <FaBuilding className="me-2" />
            Edit Company
          </h3>
        </Col>

        <Col className="text-end">
          <Button
            variant="light"
            className="me-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>

          <Button
            variant="success"
            onClick={submitHandler}
            disabled={updating}
          >
            {updating ? (
              <Spinner size="sm" />
            ) : (
              <>
                <FaSave className="me-2" />
                Save
              </>
            )}
          </Button>
        </Col>
      </Row>

      <Form onSubmit={submitHandler}>

        {/* BASIC INFO */}
        <Card className="mb-3">
          <Card.Body>
            <h5>Basic Info</h5>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Legal Name</Form.Label>
                  <Form.Control
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ROUTING (CAREFUL SECTION) */}
        <Card className="mb-3 border-warning">
          <Card.Body>
            <h5>Routing (Careful)</h5>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Slug</Form.Label>
                  <Form.Control
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Domain</Form.Label>
                  <Form.Control
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ADDRESS */}
        <Card className="mb-3">
          <Card.Body>
            <h5>Address</h5>

            <Row>
              <Col md={6}>
                <Form.Control
                  placeholder="Street"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                />
              </Col>

              <Col md={6}>
                <Form.Control
                  placeholder="City"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                />
              </Col>

              <Col md={6}>
                <Form.Control
                  placeholder="State"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                />
              </Col>

              <Col md={6}>
                <Form.Control
                  placeholder="Pincode"
                  name="pincode"
                  value={formData.address.pincode}
                  onChange={handleAddressChange}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SETTINGS */}
        <Card className="mb-3">
          <Card.Body>
            <h5>Settings</h5>

            <Form.Check
              label="Allow Online Booking"
              name="allowOnlineBooking"
              checked={formData.settings.allowOnlineBooking}
              onChange={handleSettingsChange}
            />

            <Form.Check
              label="Auto Assign Technician"
              name="autoAssignTechnician"
              checked={formData.settings.autoAssignTechnician}
              onChange={handleSettingsChange}
            />

            <Form.Check
              label="Enable Invoicing"
              name="enableInvoicing"
              checked={formData.settings.enableInvoicing}
              onChange={handleSettingsChange}
            />

            <Form.Check
              label="Enable Payments"
              name="enablePayments"
              checked={formData.settings.enablePayments}
              onChange={handleSettingsChange}
            />
          </Card.Body>
        </Card>

      </Form>
    </Container>
  );
};

export default StaffCompanyEditScreen;