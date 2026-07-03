// screens/customer/CustomerEditScreen.jsx

import React, { useState, useEffect } from "react";

import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import {
  useGetCustomerDetailsQuery,
  useUpdateCustomerMutation,
} from "../../slices/customerApiSlice";

const CustomerEditScreen = () => {
  const navigate = useNavigate();
  const { id: customerId } = useParams();

  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: customer,
    isLoading,
    error,
    refetch,
  } = useGetCustomerDetailsQuery(customerId);

  const [
    updateCustomer,
    { isLoading: loadingUpdate, error: updateError },
  ] = useUpdateCustomerMutation();

  // Basic fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [area, setArea] = useState("");

  // Address fields
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("USA");

  // Status (manager only)
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setPhone(customer.phone || "");
      setEmail(customer.email || "");
      setNotes(customer.notes || "");

      setArea(customer.area?._id || "");

      setStreet(customer.address?.street || "");
      setCity(customer.address?.city || "");
      setState(customer.address?.state || "");
      setPincode(customer.address?.pincode || "");
      setCountry(customer.address?.country || "USA");

      setIsActive(customer.isActive);
    }
  }, [customer]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateCustomer({
        customerId,

        name,
        phone,
        email,
        notes,

        // IMPORTANT: avoid empty string overwriting Mongo field
        area: area || undefined,

        address: {
          street,
          city,
          state,
          pincode,
          country,
        },

        // Only manager is allowed to send this
        ...(userInfo?.role === "manager" && {
          isActive,
        }),
      }).unwrap();

      toast.success("Customer updated successfully");

      refetch();

      navigate(`/customers/${customerId}`);
    } catch (err) {
      toast.error(
        err?.data?.message || "Failed to update customer"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        {error?.data?.message ||
          error?.error ||
          "Failed to load customer"}
      </Alert>
    );
  }

  return (
    <Row className="justify-content-center my-4">
      <Col md={10} lg={8}>
        <Card className="shadow-sm border-0">
          <Card.Body>

            {/* Header */}
            <div className="mb-4">
              <h2>Edit Customer</h2>
              <p className="text-muted mb-0">
                Update customer information
              </p>
            </div>

            {/* Error */}
            {updateError && (
              <Alert variant="danger">
                {updateError?.data?.message ||
                  updateError?.error ||
                  "Update failed"}
              </Alert>
            )}

            <Form onSubmit={submitHandler}>

              {/* BASIC INFO */}
              <Card className="mb-4">
                <Card.Header>Basic Information</Card.Header>

                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Area ID</Form.Label>
                    <Form.Control
                      value={area}
                      onChange={(e) =>
                        setArea(e.target.value)
                      }
                      placeholder="MongoDB Area ObjectId"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* ADDRESS */}
              <Card className="mb-4">
                <Card.Header>Address</Card.Header>

                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Street</Form.Label>
                    <Form.Control
                      value={street}
                      onChange={(e) =>
                        setStreet(e.target.value)
                      }
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          value={city}
                          onChange={(e) =>
                            setCity(e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          value={state}
                          onChange={(e) =>
                            setState(e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Pincode</Form.Label>
                        <Form.Control
                          value={pincode}
                          onChange={(e) =>
                            setPincode(e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          value={country}
                          onChange={(e) =>
                            setCountry(e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* NOTES */}
              <Card className="mb-4">
                <Card.Header>Notes</Card.Header>
                <Card.Body>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                  />
                </Card.Body>
              </Card>

              {/* STATUS (ONLY MANAGER) */}
              {userInfo?.role === "manager" && (
                <Card className="mb-4">
                  <Card.Header>Status</Card.Header>

                  <Card.Body>
                    <Form.Check
                      type="switch"
                      id="isActive"
                      label="Customer Active"
                      checked={isActive}
                      onChange={(e) =>
                        setIsActive(e.target.checked)
                      }
                    />
                  </Card.Body>
                </Card>
              )}

              {/* ACTIONS */}
              <div className="d-flex justify-content-between">
                <Button
                  variant="secondary"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loadingUpdate}
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
                    "Update Customer"
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

export default CustomerEditScreen;