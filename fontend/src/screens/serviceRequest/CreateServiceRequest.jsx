import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useGetAreasQuery } from "../../slices/areaApiSlice";
import { useGetCustomersQuery } from "../../slices/customerApiSlice";
import { useGetTechnicianUserOptionsQuery } from "../../slices/usersApiSlice";
import { useGetCityOptionsQuery } from "../../slices/cityApiSlice";
import {
  useCreateStaffServiceRequestMutation,
} from "../../slices/serviceRequestApiSlice";

/**
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const ISSUE_TYPES = [
  "AC Repair",
  "AC Installation",
  "Heating Issue",
  "Maintenance",
  "Other",
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

const SOURCES = [
  "call",
  "website",
  "walk-in",
  "referral",
  "mobile_app",
  "customer_portal",
];

const TIME_SLOTS = ["morning", "afternoon", "evening", "anytime"];

const SKILLS = [
  "AC Repair",
  "AC Installation",
  "Heating",
  "Electrical",
  "Maintenance",
];

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const CreateServiceRequestForm = () => {
  /**
   * AUTH
   */
  const { userInfo } = useSelector((state) => state.auth);

  const canCreate =
    userInfo?.role === "manager" ||
    userInfo?.role === "dispatcher";

  /**
   * FORM STATE
   */
  const [formData, setFormData] = useState({
    city: "",
    area: "",
    customer: "",

    title: "",
    issueType: "",
    requiredSkills: [],
    description: "",

    priority: "medium",
    source: "call",

    preferredDate: "",
    preferredTimeSlot: "anytime",

    customerNotes: "",

    serviceAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },

    attachments: [],
  });

  /**
   * CITY STATE (NEW)
   */
  const [selectedCity, setSelectedCity] = useState("");

  /**
   * QUERIES
   */
  const {
      data: cityOptionsResponse,
      isLoading: loadingCities,
      error: citiesError,
    } = useGetCityOptionsQuery();
    const cities = cityOptionsResponse?.data || [];
  
 const {
  data: areasData,
  isLoading: loadingAreas,
  error: areasError,
} = useGetAreasQuery(
  { city: selectedCity },
  {
    skip: !selectedCity,
  }
);

  const {
    data: customersData,
    isLoading: loadingCustomers,
    error: customersError,
    refetch: refetchCustomers,
  } = useGetCustomersQuery(
    {
      page: 1,
      limit: 1000,
      city: selectedCity || undefined,
      area: formData.area || undefined,
    },
    {
      skip: !canCreate || !formData.area,
    }
  );

  const [createServiceRequest, { isLoading: creatingRequest }] =
    useCreateStaffServiceRequestMutation();

  /**
   * DERIVED DATA
   */
  const areas = useMemo(() => areasData?.areas || [], [areasData]);

  const customers = useMemo(
    () => customersData?.customers || [],
    [customersData]
  );

  const selectedArea = useMemo(
    () => areas.find((a) => a._id === formData.area),
    [areas, formData.area]
  );

  const filteredAreas = useMemo(() => {
    if (!selectedCity) return [];
    return areas.filter(
      (a) =>
        a.city?._id === selectedCity ||
        a.city === selectedCity
    );
  }, [areas, selectedCity]);

  /**
   * REFRESH CUSTOMERS
   */
  useEffect(() => {
    if (formData.area) {
      refetchCustomers();
    }
  }, [formData.area, refetchCustomers]);

  /**
   * CITY CHANGE
   */
  const handleCityChange = (e) => {
    const cityId = e.target.value;

    setSelectedCity(cityId);

    setFormData((prev) => ({
      ...prev,
      city: cityId,
      area: "",
      customer: "",
    }));
  };

  /**
   * AREA CHANGE
   */
  const handleAreaChange = (e) => {
    const areaId = e.target.value;

    const areaObj = areas.find((a) => a._id === areaId);

    setFormData((prev) => ({
      ...prev,
      area: areaId,
      customer: "",
      city: areaObj?.city?._id || selectedCity || "",
    }));
  };

  /**
   * CUSTOMER CHANGE
   */
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;

    const selectedCustomer = customers.find(
      (c) => c._id === customerId
    );

    setFormData((prev) => ({
      ...prev,
      customer: customerId,

      serviceAddress: selectedCustomer?.address
        ? {
            street: selectedCustomer.address.street || "",
            city: selectedCustomer.address.city || "",
            state: selectedCustomer.address.state || "",
            pincode: selectedCustomer.address.pincode || "",
            country: selectedCustomer.address.country || "India",
          }
        : prev.serviceAddress,

      city: selectedArea?.city?._id || prev.city,
    }));
  };

  /**
   * INPUT CHANGE
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("serviceAddress.")) {
      const field = name.split(".")[1];

      setFormData((prev) => ({
        ...prev,
        serviceAddress: {
          ...prev.serviceAddress,
          [field]: value,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * SKILLS
   */
  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const exists = prev.requiredSkills.includes(skill);

      return {
        ...prev,
        requiredSkills: exists
          ? prev.requiredSkills.filter((s) => s !== skill)
          : [...prev.requiredSkills, skill],
      };
    });
  };

  /**
   * VALIDATION
   */
  const validateForm = () => {
    if (!formData.customer) return toast.error("Select customer"), false;
    if (!formData.title) return toast.error("Enter title"), false;
    if (!formData.issueType) return toast.error("Select issue type"), false;
    if (formData.description.trim().length < 10)
      return toast.error("Min 10 chars required"), false;
    if (!formData.serviceAddress.street)
      return toast.error("Street required"), false;

    return true;
  };

  /**
   * SUBMIT
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (creatingRequest) return;
    if (!canCreate) return toast.error("Not allowed");
    if (!validateForm()) return;
console.log(formData);
    try {
      await createServiceRequest({
  ...formData,
  city: formData.city,
}).unwrap();

      toast.success("Service request created");

      setFormData({
        city: "",
        area: "",
        customer: "",
        title: "",
        issueType: "",
        requiredSkills: [],
        description: "",
        priority: "medium",
        source: "call",
        preferredDate: "",
        preferredTimeSlot: "anytime",
        customerNotes: "",
        serviceAddress: {
          street: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        },
        attachments: [],
      });

      setSelectedCity("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create request");
    }
  };

  /**
   * ACCESS
   */
  if (!canCreate) {
    return <Alert variant="danger">Not authorized</Alert>;
  }

  /**
   * =======================================================
   * UI
   * =======================================================
   */

  return (
    <>
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h4 className="mb-1">
              Create Service
              Request
            </h4>

            <small className="text-muted">
              Create customer
              support/service
              request
            </small>
          </div>

          <Badge bg="primary">
            {
              userInfo?.role
            }
          </Badge>
        </div>
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* CITY */}
            <Col md={4}>
              <Form.Group>
  <Form.Label>City</Form.Label>
  <Form.Select
    value={selectedCity}
    onChange={handleCityChange}
    disabled={loadingCities}
  >
    <option value="">
      {loadingCities ? "Loading cities..." : "Select City"}
    </option>

    {cities.map((city) => (
      <option key={city._id} value={city._id}>
        {city.name}
      </option>
    ))}
  </Form.Select>

  {citiesError && (
    <div className="text-danger mt-1">
      Failed to load cities.
    </div>
  )}
</Form.Group>
            </Col>

            {/* AREA */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Area</Form.Label>
                <Form.Select
                  value={formData.area}
                  onChange={handleAreaChange}
                  disabled={!selectedCity}
                >
                  <option value="">Select Area</option>
                  {filteredAreas.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* CUSTOMER */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Customer</Form.Label>
                <Form.Select
                  value={formData.customer}
                  onChange={handleCustomerChange}
                  disabled={!formData.area}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>

            {/* Title */}
            <Col md={6}>
              <Form.Group className="mb-3">

                <Form.Label>
                  Request Title{" "}
                  <span className="text-danger">
                    *
                  </span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter request title"
                  required
                />
              </Form.Group>
            </Col>

            {/* Issue Type */}
            <Col md={6}>
              <Form.Group className="mb-3">

                <Form.Label>
                  Issue Type{" "}
                  <span className="text-danger">
                    *
                  </span>
                </Form.Label>

                <Form.Select
                  name="issueType"
                  value={
                    formData.issueType
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Select Issue
                    Type
                  </option>

                  {ISSUE_TYPES.map(
                    (
                      issue
                    ) => (
                      <option
                        key={
                          issue
                        }
                        value={
                          issue
                        }
                      >
                        {issue}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

          </Row>

          {/* Required Skills */}
          <Form.Group className="mb-4">

            <Form.Label>
              Required Skills
            </Form.Label>

            <div className="d-flex flex-wrap gap-2">

              {SKILLS.map(
                (skill) => {

                  const active =
                    formData.requiredSkills.includes(
                      skill
                    );

                  return (
                    <Button
                      key={skill}
                      type="button"
                      size="sm"
                      variant={
                        active
                          ? "primary"
                          : "outline-primary"
                      }
                      onClick={() =>
                        handleSkillToggle(
                          skill
                        )
                      }
                    >
                      {skill}
                    </Button>
                  );
                }
              )}

            </div>
          </Form.Group>

          <Row>

            {/* Priority */}
            <Col md={4}>
              <Form.Group className="mb-3">

                <Form.Label>
                  Priority
                </Form.Label>

                <Form.Select
                  name="priority"
                  value={
                    formData.priority
                  }
                  onChange={
                    handleChange
                  }
                >
                  {PRIORITIES.map(
                    (
                      priority
                    ) => (
                      <option
                        key={
                          priority
                        }
                        value={
                          priority
                        }
                      >
                        {priority.toUpperCase()}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Source */}
            <Col md={4}>
              <Form.Group className="mb-3">

                <Form.Label>
                  Source
                </Form.Label>

                <Form.Select
                  name="source"
                  value={
                    formData.source
                  }
                  onChange={
                    handleChange
                  }
                >
                  {SOURCES.map(
                    (
                      source
                    ) => (
                      <option
                        key={
                          source
                        }
                        value={
                          source
                        }
                      >
                        {source}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Time Slot */}
            <Col md={4}>
              <Form.Group className="mb-3">

                <Form.Label>
                  Preferred
                  Time Slot
                </Form.Label>

                <Form.Select
                  name="preferredTimeSlot"
                  value={
                    formData.preferredTimeSlot
                  }
                  onChange={
                    handleChange
                  }
                >
                  {TIME_SLOTS.map(
                    (
                      slot
                    ) => (
                      <option
                        key={slot}
                        value={slot}
                      >
                        {slot.toUpperCase()}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

          </Row>

          {/* Preferred Date */}
          <Form.Group className="mb-3">

            <Form.Label>
              Preferred Date
            </Form.Label>

            <Form.Control
              type="datetime-local"
              name="preferredDate"
              value={
                formData.preferredDate
              }
              onChange={
                handleChange
              }
            />
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-4">

            <Form.Label>
              Problem Description{" "}
              <span className="text-danger">
                *
              </span>
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={5}
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe the issue in detail..."
              required
            />

            {formData.description &&
              formData
                .description
                .trim()
                .length > 0 &&
              formData
                .description
                .trim()
                .length < 10 && (
                <small className="text-danger">
                  Description
                  should be at
                  least 10
                  characters
                </small>
              )}
          </Form.Group>

          {/* Customer Notes */}
          <Form.Group className="mb-4">

            <Form.Label>
              Customer Notes
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              name="customerNotes"
              value={
                formData.customerNotes
              }
              onChange={
                handleChange
              }
              placeholder="Additional customer notes..."
            />
          </Form.Group>

          {/* Service Address */}
          <Card className="mb-4 border-0 bg-light">

            <Card.Body>

              <h6 className="mb-3">
                Service Address
              </h6>

              <Row>

                <Col md={12}>
                  <Form.Group className="mb-3">

                    <Form.Label>
                      Street
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="serviceAddress.street"
                      value={
                        formData
                          .serviceAddress
                          .street
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">

                    <Form.Label>
                      City
                    </Form.Label>

                    <Form.Control
  type="text"
  name="serviceAddress.city"
  value={selectedArea?.city?.name || ""}
  readOnly
/>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">

                    <Form.Label>
                      State
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="serviceAddress.state"
                      value={
                        formData
                          .serviceAddress
                          .state
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">

                    <Form.Label>
                      Pincode
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="serviceAddress.pincode"
                      value={
                        formData
                          .serviceAddress
                          .pincode
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </Form.Group>
                </Col>

              </Row>

            </Card.Body>

          </Card>

          {/* Submit */}
          <div className="d-flex justify-content-end">

            <Button
              type="submit"
              variant="primary"
              disabled={
                creatingRequest
              }
            >
              {creatingRequest ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />

                  Creating...
                </>
              ) : (
                "Create Service Request"
              )}
            </Button>

          </div>

          
        </Form>
      </Card.Body>
    </Card>
 
    
    </>
  );
};

export default CreateServiceRequestForm;