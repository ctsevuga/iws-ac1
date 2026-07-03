import React, { useState } from "react";

import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Container,
  Spinner,
} from "react-bootstrap";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCreateCompanyMutation } from "../../slices/companyApiSlice";

const CompanyCreateScreen = () => {
  const navigate = useNavigate();

  const [createCompany, { isLoading }] = useCreateCompanyMutation();

  // =========================
  // BASIC INFO
  // =========================
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");

  // =========================
  // CONTACT INFO
  // =========================
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // =========================
  // ADDRESS
  // =========================
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("USA");

  // =========================
  // BRANDING (mapped to "brand")
  // =========================
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#1e293b");
  const [faviconUrl, setFaviconUrl] = useState("");

  // =========================
  // SETTINGS (MATCHING MODEL)
  // =========================
  const [allowOnlineBooking, setAllowOnlineBooking] = useState(true);
  const [autoAssignTechnician, setAutoAssignTechnician] = useState(false);
  const [defaultJobDurationMinutes, setDefaultJobDurationMinutes] =
    useState(60);
  const [enableInvoicing, setEnableInvoicing] = useState(true);
  const [enablePayments, setEnablePayments] = useState(true);

  // =========================
  // SUBMIT
  // =========================
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name,
        legalName,
        email,
        phone,
        website,

        address: {
          street,
          city,
          state: stateName,
          pincode,
          country,
        },

        // IMPORTANT: matches backend model
        brand: {
          primaryColor,
          secondaryColor,
          faviconUrl,
        },

        logoUrl,

        settings: {
          allowOnlineBooking,
          autoAssignTechnician,
          defaultJobDurationMinutes: Number(defaultJobDurationMinutes),
          enableInvoicing,
          enablePayments,
        },
      };

      const res = await createCompany(payload).unwrap();

      toast.success("Company created successfully");

      // optional: redirect directly to company portal
      navigate("/companies");

      // If needed:
      // navigate(`/company/${res.company.slug}`);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="mb-4 text-primary fw-bold">
                Create Company
              </h3>

              <Form onSubmit={submitHandler}>
                {/* BASIC INFO */}
                <h5>Basic Information</h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name *</Form.Label>
                      <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Legal Name</Form.Label>
                      <Form.Control
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* CONTACT */}
                <h5>Contact</h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone *</Form.Label>
                      <Form.Control
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </Form.Group>

                {/* ADDRESS */}
                <h5>Address</h5>

                <Row>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="mb-3"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Control
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mb-3"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Control
                      placeholder="State"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="mb-3"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Control
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="mb-3"
                    />
                  </Col>

                  <Col md={12}>
                    <Form.Control
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </Col>
                </Row>

                {/* BRANDING */}
                <h5 className="mt-4">Branding</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Logo URL</Form.Label>
                  <Form.Control
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Primary Color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="mb-3"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Control
                      placeholder="Secondary Color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="mb-3"
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Favicon URL</Form.Label>
                  <Form.Control
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                  />
                </Form.Group>

                {/* SETTINGS */}
                <h5>Settings</h5>

                <Form.Check
                  type="switch"
                  label="Allow Online Booking"
                  checked={allowOnlineBooking}
                  onChange={(e) =>
                    setAllowOnlineBooking(e.target.checked)
                  }
                />

                <Form.Check
                  type="switch"
                  label="Auto Assign Technician"
                  checked={autoAssignTechnician}
                  onChange={(e) =>
                    setAutoAssignTechnician(e.target.checked)
                  }
                />

                <Form.Check
                  type="switch"
                  label="Enable Invoicing"
                  checked={enableInvoicing}
                  onChange={(e) =>
                    setEnableInvoicing(e.target.checked)
                  }
                />

                <Form.Check
                  type="switch"
                  label="Enable Payments"
                  checked={enablePayments}
                  onChange={(e) =>
                    setEnablePayments(e.target.checked)
                  }
                />

                <Form.Group className="mt-3 mb-4">
                  <Form.Label>
                    Default Job Duration (Minutes)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={defaultJobDurationMinutes}
                    onChange={(e) =>
                      setDefaultJobDurationMinutes(e.target.value)
                    }
                  />
                </Form.Group>

                {/* SUBMIT */}
                <div className="d-grid">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Company"
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

export default CompanyCreateScreen;