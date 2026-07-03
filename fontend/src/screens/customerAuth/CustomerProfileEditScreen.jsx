import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import { toast } from "react-toastify";

import {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
} from "../../slices/customerAuthApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import FormContainer from "../../components/FormContainer";

const CustomerProfileEditScreen = () => {
  const {
    data: profile,
    isLoading,
    error,
  } = useGetCustomerProfileQuery();

  const [
    updateCustomerProfile,
    {
      isLoading: loadingUpdate,
    },
  ] = useUpdateCustomerProfileMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("USA");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");

      setStreet(profile.address?.street || "");
      setCity(profile.address?.city || "");
      setStateName(profile.address?.state || "");
      setPincode(profile.address?.pincode || "");
      setCountry(
        profile.address?.country || "USA"
      );
    }
  }, [profile]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await updateCustomerProfile({
        name,
        email,
        address: {
          street,
          city,
          state: stateName,
          pincode,
          country,
        },
        ...(password && { password }),
      }).unwrap();

      toast.success("Profile updated successfully");

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err.error ||
          "Failed to update profile"
      );
    }
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  }

  return (
    <FormContainer>
      <Card className="shadow-sm">
        <Card.Header>
          <h3 className="mb-0">
            Edit Profile
          </h3>
        </Card.Header>

        <Card.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group
              className="mb-3"
              controlId="name"
            >
              <Form.Label>
                Full Name
              </Form.Label>

              <Form.Control
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </Form.Group>

            <Form.Group
              className="mb-3"
              controlId="phone"
            >
              <Form.Label>
                Phone Number
              </Form.Label>

              <Form.Control
                type="text"
                value={profile?.phone || ""}
                disabled
              />

              <Form.Text muted>
                Phone number cannot be changed.
              </Form.Text>
            </Form.Group>

            <Form.Group
              className="mb-4"
              controlId="email"
            >
              <Form.Label>Email</Form.Label>

              <Form.Control
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </Form.Group>

            <hr />

            <h5 className="mb-3">
              Address Information
            </h5>

            <Form.Group
              className="mb-3"
              controlId="street"
            >
              <Form.Label>Street</Form.Label>

              <Form.Control
                type="text"
                value={street}
                onChange={(e) =>
                  setStreet(e.target.value)
                }
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="city"
                >
                  <Form.Label>
                    City
                  </Form.Label>

                  <Form.Control
                    type="text"
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="state"
                >
                  <Form.Label>
                    State
                  </Form.Label>

                  <Form.Control
                    type="text"
                    value={stateName}
                    onChange={(e) =>
                      setStateName(
                        e.target.value
                      )
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="pincode"
                >
                  <Form.Label>
                    ZIP / Postal Code
                  </Form.Label>

                  <Form.Control
                    type="text"
                    value={pincode}
                    onChange={(e) =>
                      setPincode(
                        e.target.value
                      )
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="country"
                >
                  <Form.Label>
                    Country
                  </Form.Label>

                  <Form.Control
                    type="text"
                    value={country}
                    onChange={(e) =>
                      setCountry(
                        e.target.value
                      )
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <h5 className="mb-3">
              Change Password
            </h5>

            <Form.Group
              className="mb-3"
              controlId="password"
            >
              <Form.Label>
                New Password
              </Form.Label>

              <Form.Control
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />
            </Form.Group>

            <Form.Group
              className="mb-4"
              controlId="confirmPassword"
            >
              <Form.Label>
                Confirm Password
              </Form.Label>

              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />
            </Form.Group>

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                disabled={loadingUpdate}
              >
                {loadingUpdate
                  ? "Saving..."
                  : "Update Profile"}
              </Button>
            </div>

            {loadingUpdate && (
              <div className="mt-3">
                <Loader />
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default CustomerProfileEditScreen;