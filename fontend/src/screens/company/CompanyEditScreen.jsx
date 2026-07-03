import React, { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";

import { FaArrowLeft, FaBuilding, FaSave } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import { toast } from "react-toastify";

import {
  useGetCompanyDetailsQuery,
  useGetMyCompanyQuery,
  useUpdateCompanyMutation,
  useUpdateMyCompanyMutation,
} from "../../slices/companyApiSlice";

const CompanyEditScreen = () => {
  const { id: paramId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const role = userInfo?.role?.toLowerCase();
  const isAdmin = role === "admin";

  const companyId = isAdmin ? paramId : userInfo?.company?._id;

  const skipAdminQuery = !isAdmin || !companyId;

  const {
    data: adminCompany,
    isLoading: adminLoading,
    error: adminError,
  } = useGetCompanyDetailsQuery(companyId, {
    skip: skipAdminQuery,
  });

  const {
    data: managerCompany,
    isLoading: managerLoading,
    error: managerError,
  } = useGetMyCompanyQuery(undefined, {
    skip: isAdmin,
  });

  const company = isAdmin ? adminCompany : managerCompany;
  const isLoading = isAdmin ? adminLoading : managerLoading;
  const error = isAdmin ? adminError : managerError;

  const [updateAdminCompany, { isLoading: loadingAdmin }] =
    useUpdateCompanyMutation();

  const [updateMyCompany, { isLoading: loadingManager }] =
    useUpdateMyCompanyMutation();

  const loadingUpdate = isAdmin ? loadingAdmin : loadingManager;

  /**
   * =========================
   * STATE
   * =========================
   */

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("USA");

  const [logoUrl, setLogoUrl] = useState("");

  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currency, setCurrency] = useState("INR");

  const [allowOnlineBooking, setAllowOnlineBooking] = useState(true);
  const [autoAssignTechnician, setAutoAssignTechnician] = useState(false);
  const [defaultJobDurationMinutes, setDefaultJobDurationMinutes] =
    useState(60);
  const [enableInvoicing, setEnableInvoicing] = useState(true);
  const [enablePayments, setEnablePayments] = useState(true);

  /**
   * =========================
   * POPULATE FORM
   * =========================
   */

  useEffect(() => {
    if (!company) return;

    setName(company.name || "");
    setLegalName(company.legalName || "");

    setEmail(company.email || "");
    setPhone(company.phone || "");
    setWebsite(company.website || "");

    setStreet(company.address?.street || "");
    setCity(company.address?.city || "");
    setStateName(company.address?.state || "");
    setPincode(company.address?.pincode || "");
    setCountry(company.address?.country || "USA");

    setLogoUrl(company.logoUrl || "");

    setTimezone(company.timezone || "Asia/Kolkata");
    setCurrency(company.currency || "INR");

    setAllowOnlineBooking(company.settings?.allowOnlineBooking ?? true);
    setAutoAssignTechnician(company.settings?.autoAssignTechnician ?? false);
    setDefaultJobDurationMinutes(
      company.settings?.defaultJobDurationMinutes ?? 60
    );
    setEnableInvoicing(company.settings?.enableInvoicing ?? true);
    setEnablePayments(company.settings?.enablePayments ?? true);
  }, [company?._id]);

  if (!companyId) {
    return (
      <Container className="py-5 text-center">
        <h4>Access Denied</h4>
        <p>No company context available.</p>
      </Container>
    );
  }

  /**
   * =========================
   * SUBMIT
   * =========================
   */

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name,
        legalName,
        email,
        phone,
        website,
        timezone,
        currency,

        address: {
          street,
          city,
          state: stateName,
          pincode,
          country,
        },

        // Model-level field
        logoUrl,

        settings: {
          allowOnlineBooking,
          autoAssignTechnician,
          defaultJobDurationMinutes: Number(defaultJobDurationMinutes),
          enableInvoicing,
          enablePayments,
        },
      };

      if (isAdmin) {
        await updateAdminCompany({
          companyId,
          ...payload,
        }).unwrap();
      } else {
        await updateMyCompany(payload).unwrap();
      }

      toast.success("Company updated successfully");

      navigate(isAdmin ? `/companies/${companyId}` : "/company/profile");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  /**
   * =========================
   * LOADING / ERROR
   * =========================
   */

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Card>
          <Card.Body className="text-danger text-center">
            {error?.data?.message || "Failed to load company"}
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold text-primary">
            <FaBuilding className="me-2" />
            Edit Company
          </h3>
          <small className="text-muted">
            {isAdmin ? "Admin Mode" : "My Company"}
          </small>
        </Col>

        <Col className="text-end">
          <Button
            variant="light"
            onClick={() =>
              navigate(
                isAdmin ? `/companies/${companyId}` : "/company/profile"
              )
            }
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={submitHandler}>
            <div className="d-grid mb-4">
              <Button type="submit" disabled={loadingUpdate} size="lg">
                {loadingUpdate ? "Updating..." : "Update Company"}
              </Button>
            </div>

            <h5 className="mb-3">Basic Information</h5>

            <Form.Group className="mb-3">
              <Form.Label>Company Name *</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Legal Name</Form.Label>
              <Form.Control
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            </Form.Group>

            <h5 className="mt-4 mb-3 text-primary">
              Contact Information
            </h5>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone *</Form.Label>
              <Form.Control
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </Form.Group>

            <h5 className="mt-4 mb-3 text-primary">Address</h5>

            <Form.Group className="mb-3">
              <Form.Label>Street</Form.Label>
              <Form.Control
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pincode</Form.Label>
              <Form.Control
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </Form.Group>

            <h5 className="mt-4 mb-3 text-primary">Branding</h5>

            <Form.Group className="mb-3">
              <Form.Label>Logo URL</Form.Label>
              <Form.Control
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </Form.Group>

            <h5 className="mt-4 mb-3 text-primary">
              Business Settings
            </h5>

            <Form.Group className="mb-3">
              <Form.Label>Timezone</Form.Label>
              <Form.Control
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Currency</Form.Label>
              <Form.Control
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </Form.Group>

            <h5 className="mt-4 mb-3 text-primary">
              Operational Settings
            </h5>

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

            <Form.Group className="mb-4">
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

            <div className="d-grid">
              <Button
                type="submit"
                disabled={loadingUpdate}
                size="lg"
              >
                {loadingUpdate ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Update Company
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CompanyEditScreen;